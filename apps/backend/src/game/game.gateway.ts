/**
 * 게임 WebSocket 게이트웨이
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from '../rooms/rooms.service';
import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  type GameReadyPayload,
  type GameBetPayload,
  type GameChallengePayload,
} from '@pirate-dice/types';
import { ERROR_MESSAGES, GAME_TIMING } from '@pirate-dice/constants';

/** 도전 타임 상태 */
interface ChallengePhaseState {
  bettorId: string;
  bettorNickname: string;
  bet: { diceValue: number; diceCount: number };
  passedPlayerIds: Set<string>;
  eligiblePlayerIds: string[];
  timer: ReturnType<typeof setTimeout> | null;
  nextPlayerId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  /** 소켓 ID -> { playerId, roomId } 매핑 */
  private socketPlayerMap: Map<string, { playerId: string; roomId: string }> = new Map();

  /** 방 ID -> 도전 타임 상태 */
  private challengePhaseMap: Map<string, ChallengePhaseState> = new Map();

  constructor(private readonly roomsService: RoomsService) {}

  /**
   * 클라이언트 연결
   */
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  /**
   * 클라이언트 연결 해제
   */
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const playerInfo = this.socketPlayerMap.get(client.id);
    if (playerInfo) {
      const engine = this.roomsService.getGameEngine(playerInfo.roomId);
      if (engine) {
        const room = engine.getRoom();

        // 게임 중이 아니면 퇴장 처리
        if (room.status === 'waiting') {
          this.roomsService.leaveRoom(playerInfo.roomId, playerInfo.playerId);

          this.server.to(playerInfo.roomId).emit(SERVER_EVENTS.PLAYER_LEFT, {
            playerId: playerInfo.playerId,
            playerCount: room.players.length,
          });
        }
        // 게임 중이면 탈락 처리
        else if (room.status === 'playing') {
          this.handlePlayerDisconnectDuringGame(playerInfo.roomId, playerInfo.playerId);
        }
      }

      this.socketPlayerMap.delete(client.id);
    }
  }

  /**
   * 게임 중 플레이어 접속 종료 처리
   */
  private handlePlayerDisconnectDuringGame(roomId: string, playerId: string) {
    const engine = this.roomsService.getGameEngine(roomId);
    if (!engine) return;

    const room = engine.getRoom();
    const player = room.players.find(p => p.id === playerId);
    if (!player || !player.isAlive) return;

    // 플레이어 탈락 처리
    player.isAlive = false;
    room.discardedDice += player.diceCount;
    player.diceCount = 0;
    player.currentDice = [];

    // 도전 타임 중이면 취소
    const challengePhase = this.challengePhaseMap.get(roomId);
    if (challengePhase) {
      // 해당 플레이어가 베팅자였으면 도전 타임 취소
      if (challengePhase.bettorId === playerId) {
        if (challengePhase.timer) {
          clearTimeout(challengePhase.timer);
        }
        this.challengePhaseMap.delete(roomId);
      } else {
        // 도전 가능 목록에서 제거
        challengePhase.eligiblePlayerIds = challengePhase.eligiblePlayerIds.filter(id => id !== playerId);
        // 모두 패스했는지 확인
        const allPassed = challengePhase.eligiblePlayerIds.every(id =>
          challengePhase.passedPlayerIds.has(id)
        );
        if (allPassed) {
          this.endChallengePhase(roomId, 'all_passed');
        }
      }
    }

    // 탈락 알림
    this.server.to(roomId).emit(SERVER_EVENTS.PLAYER_ELIMINATED, {
      playerId,
      playerNickname: player.nickname,
    });

    // 생존자 수 확인
    const alivePlayers = room.players.filter(p => p.isAlive);

    // 1명만 남으면 게임 종료
    if (alivePlayers.length <= 1) {
      room.status = 'finished';
      const winner = alivePlayers[0];
      if (winner) {
        room.winnerId = winner.id;
        this.server.to(roomId).emit(SERVER_EVENTS.GAME_ENDED, {
          winnerId: winner.id,
          winnerNickname: winner.nickname,
        });
      }
      return;
    }

    // 해당 플레이어 턴이었으면 다음 턴으로
    if (room.currentTurnPlayerId === playerId) {
      // 다음 플레이어 찾기
      const sortedAlive = alivePlayers.sort((a, b) => a.order - b.order);
      const currentIdx = sortedAlive.findIndex(p => p.order > (player.order ?? 0));
      const nextPlayer = currentIdx >= 0 ? sortedAlive[currentIdx] : sortedAlive[0];

      if (nextPlayer) {
        room.currentTurnPlayerId = nextPlayer.id;

        // 턴 변경 알림
        this.server.to(roomId).emit(SERVER_EVENTS.TURN_CHANGED, {
          currentPlayerId: nextPlayer.id,
          currentBet: room.currentBet
            ? {
                playerId: room.currentBet.playerId,
                diceValue: room.currentBet.diceValue,
                diceCount: room.currentBet.diceCount,
              }
            : null,
        });
      }
    }
  }

  /**
   * 방 참가 (소켓 룸 조인)
   */
  @SubscribeMessage('room:join')
  handleRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; playerId: string },
  ): { success: boolean; room?: object; error?: string } {
    const { roomId, playerId } = payload;
    console.log('room:join called:', { roomId, playerId, clientId: client.id });

    const room = this.roomsService.getRoom(roomId);
    if (!room) {
      console.log('room:join failed - room not found:', roomId);
      return {
        success: false,
        error: ERROR_MESSAGES.ROOM_NOT_FOUND,
      };
    }

    // 플레이어가 방에 존재하는지 확인
    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      console.log('room:join failed - player not in room:', { roomId, playerId, players: room.players.map(p => p.id) });
      return {
        success: false,
        error: '플레이어가 방에 존재하지 않습니다.',
      };
    }

    // 소켓 룸 참가
    client.join(roomId);
    this.socketPlayerMap.set(client.id, { playerId, roomId });

    console.log('room:join success:', { roomId, playerId, playerCount: room.players.length });

    const playersData = room.players.map(p => ({
      id: p.id,
      nickname: p.nickname,
      diceCount: p.diceCount,
      order: p.order,
      isAlive: p.isAlive,
      isReady: p.isReady,
    }));

    // 다른 플레이어들에게 입장 알림 (본인 제외)
    client.to(roomId).emit(SERVER_EVENTS.PLAYER_JOINED, {
      playerId,
      nickname: player.nickname,
      playerCount: room.players.length,
      players: playersData,
    });

    // 본인에게도 room:synced 이벤트 전송 (콜백 응답 백업)
    client.emit('room:synced', {
      hostId: room.hostId,
      status: room.status,
      players: playersData,
    });

    // 방 정보 반환 (NestJS가 자동으로 ack로 전송)
    const response = {
      success: true,
      room: {
        hostId: room.hostId,
        status: room.status,
        players: room.players.map(p => ({
          id: p.id,
          nickname: p.nickname,
          diceCount: p.diceCount,
          order: p.order,
          isAlive: p.isAlive,
          isReady: p.isReady,
        })),
      },
    };
    console.log('room:join returning:', JSON.stringify(response));
    return response;
  }

  /**
   * 방 나가기
   */
  @SubscribeMessage('room:leave')
  handleRoomLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ): { success: boolean; error?: string } {
    const { roomId } = payload;
    const playerInfo = this.socketPlayerMap.get(client.id);

    console.log('room:leave called:', { roomId, playerInfo, clientId: client.id });

    if (!playerInfo) {
      return { success: false, error: 'PLAYER_NOT_FOUND' };
    }

    if (playerInfo.roomId !== roomId) {
      return { success: false, error: 'INVALID_ROOM' };
    }

    const engine = this.roomsService.getGameEngine(roomId);
    if (!engine) {
      return { success: false, error: 'ROOM_NOT_FOUND' };
    }

    const room = engine.getRoom();

    // 게임 중에는 나갈 수 없음
    if (room.status === 'playing') {
      return { success: false, error: 'GAME_IN_PROGRESS' };
    }

    // 방에서 플레이어 제거
    this.roomsService.leaveRoom(roomId, playerInfo.playerId);

    // 소켓 룸에서 나가기
    client.leave(roomId);
    this.socketPlayerMap.delete(client.id);

    // 다른 플레이어들에게 알림
    this.server.to(roomId).emit(SERVER_EVENTS.PLAYER_LEFT, {
      playerId: playerInfo.playerId,
      playerCount: room.players.length,
    });

    console.log('room:leave success:', { roomId, playerId: playerInfo.playerId });

    return { success: true };
  }

  /**
   * 게임 준비 완료
   */
  @SubscribeMessage(CLIENT_EVENTS.GAME_READY)
  handleGameReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: GameReadyPayload
  ): { success: boolean; isReady?: boolean; error?: string } {
    const { roomId } = payload;
    const playerInfo = this.socketPlayerMap.get(client.id);

    console.log('handleGameReady called:', {
      roomId,
      playerInfo,
      clientId: client.id,
      socketMapSize: this.socketPlayerMap.size,
      socketMapKeys: Array.from(this.socketPlayerMap.keys()),
    });

    if (!playerInfo) {
      console.log('handleGameReady failed - playerInfo not found for socket:', client.id);
      return { success: false, error: 'PLAYER_NOT_FOUND' };
    }

    if (playerInfo.roomId !== roomId) {
      console.log('handleGameReady failed - room mismatch:', { expected: playerInfo.roomId, received: roomId });
      return { success: false, error: 'INVALID_ROOM' };
    }

    const engine = this.roomsService.getGameEngine(roomId);
    if (!engine) {
      console.log('handleGameReady failed - engine not found:', roomId);
      return { success: false, error: 'ENGINE_NOT_FOUND' };
    }

    // 준비 상태 변경
    const result = engine.setPlayerReady(playerInfo.playerId, true);
    console.log('setPlayerReady result:', { playerId: playerInfo.playerId, result });

    if (!result) {
      console.log('handleGameReady failed - setPlayerReady returned false');
      return { success: false, error: 'SET_READY_FAILED' };
    }

    // 모든 플레이어에게 준비 상태 변경 알림
    this.server.to(roomId).emit('player:ready', {
      playerId: playerInfo.playerId,
      isReady: true,
    });

    console.log('player:ready emitted:', { roomId, playerId: playerInfo.playerId });

    // 모두 준비되면 게임 시작 가능 알림
    const canStart = engine.canStartGame();
    console.log('canStartGame:', { roomId, canStart });

    if (canStart) {
      this.server.to(roomId).emit('game:canStart', { canStart: true });
    }

    return { success: true, isReady: true };
  }

  /**
   * 게임 시작 (방장만 가능)
   */
  @SubscribeMessage('game:start')
  handleGameStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string }
  ) {
    const { roomId } = payload;
    const playerInfo = this.socketPlayerMap.get(client.id);

    if (!playerInfo) {
      return;
    }

    const engine = this.roomsService.getGameEngine(roomId);
    if (!engine) {
      return;
    }

    const room = engine.getRoom();

    // 방장만 시작 가능
    if (room.hostId !== playerInfo.playerId) {
      client.emit(SERVER_EVENTS.ERROR, {
        code: 'NOT_HOST',
        message: '방장만 게임을 시작할 수 있습니다.',
      });
      return;
    }

    // 게임 시작
    const started = engine.startGame();
    if (!started) {
      client.emit(SERVER_EVENTS.ERROR, {
        code: 'CANNOT_START',
        message: '게임을 시작할 수 없습니다.',
      });
      return;
    }

    // 게임 시작 알림
    this.server.to(roomId).emit(SERVER_EVENTS.GAME_STARTED, {
      players: room.players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        diceCount: p.diceCount,
        order: p.order,
      })),
      firstPlayerId: room.currentTurnPlayerId,
    });

    // 각 플레이어에게 자신의 주사위 전송
    for (const [socketId, info] of this.socketPlayerMap) {
      if (info.roomId === roomId) {
        const dice = engine.getPlayerDice(info.playerId);
        this.server.to(socketId).emit(SERVER_EVENTS.ROUND_STARTED, {
          round: room.currentRound,
          yourDice: dice,
        });
      }
    }

    return { success: true };
  }

  /**
   * 베팅
   */
  @SubscribeMessage(CLIENT_EVENTS.GAME_BET)
  handleBet(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: GameBetPayload
  ) {
    const { roomId, diceValue, diceCount } = payload;
    const playerInfo = this.socketPlayerMap.get(client.id);

    if (!playerInfo || playerInfo.roomId !== roomId) {
      return;
    }

    // 도전 타임 중에는 베팅 불가
    if (this.challengePhaseMap.has(roomId)) {
      client.emit(SERVER_EVENTS.ERROR, {
        code: 'CHALLENGE_PHASE_ACTIVE',
        message: '도전 타임 중에는 베팅할 수 없습니다.',
      });
      return;
    }

    const engine = this.roomsService.getGameEngine(roomId);
    if (!engine) {
      return;
    }

    // 베팅 처리
    const success = engine.placeBet(playerInfo.playerId, diceValue, diceCount);

    if (!success) {
      client.emit(SERVER_EVENTS.ERROR, {
        code: 'INVALID_BET',
        message: '유효하지 않은 베팅입니다.',
      });
      return;
    }

    const room = engine.getRoom();
    const currentBet = engine.getCurrentBet();
    const bettor = room.players.find(p => p.id === playerInfo.playerId);

    // 베팅 알림 (턴 변경 없이 현재 베팅 정보만)
    this.server.to(roomId).emit(SERVER_EVENTS.TURN_CHANGED, {
      currentPlayerId: null, // 도전 타임 동안은 턴 없음
      currentBet: currentBet
        ? {
            playerId: currentBet.playerId,
            diceValue: currentBet.diceValue,
            diceCount: currentBet.diceCount,
          }
        : null,
    });

    // 도전 타임 시작
    this.startChallengePhase(roomId, {
      bettorId: playerInfo.playerId,
      bettorNickname: bettor?.nickname ?? 'Unknown',
      bet: { diceValue, diceCount },
    });

    return { success: true };
  }

  /**
   * 도전 타임 시작
   */
  private startChallengePhase(
    roomId: string,
    betInfo: { bettorId: string; bettorNickname: string; bet: { diceValue: number; diceCount: number } }
  ) {
    const engine = this.roomsService.getGameEngine(roomId);
    if (!engine) return;

    const room = engine.getRoom();

    // 도전 가능한 플레이어 (베팅자 제외, 생존자만)
    const eligiblePlayers = room.players.filter(
      p => p.id !== betInfo.bettorId && p.isAlive
    );

    // 다음 턴 플레이어 계산
    const alivePlayers = room.players.filter(p => p.isAlive).sort((a, b) => a.order - b.order);
    const currentIdx = alivePlayers.findIndex(p => p.id === betInfo.bettorId);
    const nextIdx = (currentIdx + 1) % alivePlayers.length;
    const nextPlayerId = alivePlayers[nextIdx]?.id ?? betInfo.bettorId;

    const challengePhase: ChallengePhaseState = {
      bettorId: betInfo.bettorId,
      bettorNickname: betInfo.bettorNickname,
      bet: betInfo.bet,
      passedPlayerIds: new Set(),
      eligiblePlayerIds: eligiblePlayers.map(p => p.id),
      nextPlayerId,
      timer: null,
    };

    // 타이머 설정
    challengePhase.timer = setTimeout(() => {
      this.endChallengePhase(roomId, 'timeout');
    }, GAME_TIMING.CHALLENGE_PHASE_TIMEOUT);

    this.challengePhaseMap.set(roomId, challengePhase);

    // 도전 타임 시작 알림
    this.server.to(roomId).emit(SERVER_EVENTS.CHALLENGE_PHASE_STARTED, {
      bettorId: betInfo.bettorId,
      bettorNickname: betInfo.bettorNickname,
      bet: betInfo.bet,
      timeoutMs: GAME_TIMING.CHALLENGE_PHASE_TIMEOUT,
    });
  }

  /**
   * 도전 타임 종료
   */
  private endChallengePhase(roomId: string, reason: 'timeout' | 'all_passed') {
    const challengePhase = this.challengePhaseMap.get(roomId);
    if (!challengePhase) return;

    // 타이머 정리
    if (challengePhase.timer) {
      clearTimeout(challengePhase.timer);
    }

    this.challengePhaseMap.delete(roomId);

    const engine = this.roomsService.getGameEngine(roomId);
    if (!engine) return;

    const room = engine.getRoom();

    // 다음 턴으로 전환
    room.currentTurnPlayerId = challengePhase.nextPlayerId;

    // 도전 타임 종료 알림
    this.server.to(roomId).emit(SERVER_EVENTS.CHALLENGE_PHASE_ENDED, {
      reason,
      nextPlayerId: challengePhase.nextPlayerId,
    });

    // 턴 변경 알림
    this.server.to(roomId).emit(SERVER_EVENTS.TURN_CHANGED, {
      currentPlayerId: challengePhase.nextPlayerId,
      currentBet: {
        playerId: challengePhase.bettorId,
        diceValue: challengePhase.bet.diceValue,
        diceCount: challengePhase.bet.diceCount,
      },
    });
  }

  /**
   * 묵시 (패스)
   */
  @SubscribeMessage(CLIENT_EVENTS.GAME_PASS)
  handlePass(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string }
  ) {
    const { roomId } = payload;
    const playerInfo = this.socketPlayerMap.get(client.id);

    if (!playerInfo || playerInfo.roomId !== roomId) {
      return { success: false, error: 'INVALID_REQUEST' };
    }

    const challengePhase = this.challengePhaseMap.get(roomId);
    if (!challengePhase) {
      return { success: false, error: 'NO_CHALLENGE_PHASE' };
    }

    // 이미 패스한 플레이어인지 확인
    if (challengePhase.passedPlayerIds.has(playerInfo.playerId)) {
      return { success: false, error: 'ALREADY_PASSED' };
    }

    // 도전 가능한 플레이어인지 확인
    if (!challengePhase.eligiblePlayerIds.includes(playerInfo.playerId)) {
      return { success: false, error: 'NOT_ELIGIBLE' };
    }

    const engine = this.roomsService.getGameEngine(roomId);
    if (!engine) return { success: false, error: 'ENGINE_NOT_FOUND' };

    const room = engine.getRoom();
    const player = room.players.find(p => p.id === playerInfo.playerId);

    // 패스 기록
    challengePhase.passedPlayerIds.add(playerInfo.playerId);

    // 패스 알림
    this.server.to(roomId).emit(SERVER_EVENTS.PLAYER_PASSED, {
      playerId: playerInfo.playerId,
      nickname: player?.nickname ?? 'Unknown',
      passedPlayerIds: Array.from(challengePhase.passedPlayerIds),
    });

    // 모든 플레이어가 패스했는지 확인
    const allPassed = challengePhase.eligiblePlayerIds.every(id =>
      challengePhase.passedPlayerIds.has(id)
    );

    if (allPassed) {
      this.endChallengePhase(roomId, 'all_passed');
    }

    return { success: true };
  }

  /**
   * 도전
   */
  @SubscribeMessage(CLIENT_EVENTS.GAME_CHALLENGE)
  handleChallenge(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: GameChallengePayload
  ) {
    const { roomId } = payload;
    const playerInfo = this.socketPlayerMap.get(client.id);

    if (!playerInfo || playerInfo.roomId !== roomId) {
      return;
    }

    const challengePhase = this.challengePhaseMap.get(roomId);

    // 도전 타임이 활성화되어 있으면 해당 상태에서 도전 처리
    if (challengePhase) {
      // 도전 가능한 플레이어인지 확인
      if (!challengePhase.eligiblePlayerIds.includes(playerInfo.playerId)) {
        client.emit(SERVER_EVENTS.ERROR, {
          code: 'NOT_ELIGIBLE',
          message: '도전할 수 없는 플레이어입니다.',
        });
        return;
      }

      // 타이머 정리
      if (challengePhase.timer) {
        clearTimeout(challengePhase.timer);
      }
      this.challengePhaseMap.delete(roomId);
    }

    const engine = this.roomsService.getGameEngine(roomId);
    if (!engine) {
      return;
    }

    // 도전 타임 중이면 임시로 현재 턴을 도전자로 설정
    const room = engine.getRoom();
    if (challengePhase) {
      room.currentTurnPlayerId = playerInfo.playerId;
    }

    // 도전 처리
    const result = engine.challenge(playerInfo.playerId);

    if (!result) {
      client.emit(SERVER_EVENTS.ERROR, {
        code: 'INVALID_CHALLENGE',
        message: '도전할 수 없습니다.',
      });
      return;
    }

    // 도전 결과 알림
    this.server.to(roomId).emit(SERVER_EVENTS.CHALLENGE_RESULT, { result });

    // 탈락 플레이어 알림
    for (const loserId of result.loserPlayerIds) {
      const loser = room.players.find(p => p.id === loserId);
      if (loser && !loser.isAlive) {
        this.server.to(roomId).emit(SERVER_EVENTS.PLAYER_ELIMINATED, {
          playerId: loserId,
          playerNickname: loser.nickname,
        });
      }
    }

    // 게임 종료 확인
    if (room.status === 'finished' && room.winnerId) {
      const winner = room.players.find(p => p.id === room.winnerId);
      this.server.to(roomId).emit(SERVER_EVENTS.GAME_ENDED, {
        winnerId: room.winnerId,
        winnerNickname: winner?.nickname ?? 'Unknown',
      });
    } else {
      // 다음 라운드 시작 - 각 플레이어에게 새 주사위 전송
      for (const [socketId, info] of this.socketPlayerMap) {
        if (info.roomId === roomId) {
          const player = room.players.find(p => p.id === info.playerId);
          const dice = engine.getPlayerDice(info.playerId);
          this.server.to(socketId).emit(SERVER_EVENTS.ROUND_STARTED, {
            round: room.currentRound,
            yourDice: dice,
            isEliminated: player ? !player.isAlive : false,
          });
        }
      }

      // 현재 턴 플레이어 알림
      this.server.to(roomId).emit(SERVER_EVENTS.TURN_CHANGED, {
        currentPlayerId: room.currentTurnPlayerId,
        currentBet: null,
      });
    }

    return { success: true };
  }

  /**
   * 채팅 메시지 전송
   */
  @SubscribeMessage('chat:send')
  handleChatSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; message: string }
  ): { success: boolean; error?: string } {
    const { roomId, message } = payload;
    const playerInfo = this.socketPlayerMap.get(client.id);

    if (!playerInfo || playerInfo.roomId !== roomId) {
      return { success: false, error: 'INVALID_ROOM' };
    }

    const engine = this.roomsService.getGameEngine(roomId);
    if (!engine) {
      return { success: false, error: 'ROOM_NOT_FOUND' };
    }

    const room = engine.getRoom();
    const player = room.players.find(p => p.id === playerInfo.playerId);

    if (!player) {
      return { success: false, error: 'PLAYER_NOT_FOUND' };
    }

    // 모든 플레이어에게 채팅 메시지 브로드캐스트
    this.server.to(roomId).emit('chat:message', {
      playerId: playerInfo.playerId,
      nickname: player.nickname,
      message,
    });

    return { success: true };
  }

  /**
   * 도망치기 (게임 중 자발적 탈락)
   */
  @SubscribeMessage('game:runaway')
  handleRunaway(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string }
  ): { success: boolean; error?: string } {
    const { roomId } = payload;
    const playerInfo = this.socketPlayerMap.get(client.id);

    if (!playerInfo || playerInfo.roomId !== roomId) {
      return { success: false, error: 'INVALID_ROOM' };
    }

    const engine = this.roomsService.getGameEngine(roomId);
    if (!engine) {
      return { success: false, error: 'ROOM_NOT_FOUND' };
    }

    const room = engine.getRoom();

    // 게임 중에만 도망 가능
    if (room.status !== 'playing') {
      return { success: false, error: 'GAME_NOT_IN_PROGRESS' };
    }

    const player = room.players.find(p => p.id === playerInfo.playerId);
    if (!player) {
      return { success: false, error: 'PLAYER_NOT_FOUND' };
    }

    // 이미 탈락한 플레이어도 도망 가능 (관전 중인 경우)
    const wasAlive = player.isAlive;

    // 플레이어 탈락 처리
    if (wasAlive) {
      player.isAlive = false;
      room.discardedDice += player.diceCount;
      player.diceCount = 0;
      player.currentDice = [];

      // 도전 타임 중이면 처리
      const challengePhase = this.challengePhaseMap.get(roomId);
      if (challengePhase) {
        if (challengePhase.bettorId === playerInfo.playerId) {
          if (challengePhase.timer) {
            clearTimeout(challengePhase.timer);
          }
          this.challengePhaseMap.delete(roomId);
        } else {
          challengePhase.eligiblePlayerIds = challengePhase.eligiblePlayerIds.filter(
            id => id !== playerInfo.playerId
          );
          const allPassed = challengePhase.eligiblePlayerIds.every(id =>
            challengePhase.passedPlayerIds.has(id)
          );
          if (allPassed) {
            this.endChallengePhase(roomId, 'all_passed');
          }
        }
      }

      // 탈락 알림
      this.server.to(roomId).emit(SERVER_EVENTS.PLAYER_ELIMINATED, {
        playerId: playerInfo.playerId,
        playerNickname: player.nickname,
      });
    }

    // 방에서 플레이어 제거
    this.roomsService.leaveRoom(roomId, playerInfo.playerId);

    // 소켓 룸에서 나가기
    client.leave(roomId);
    this.socketPlayerMap.delete(client.id);

    // 퇴장 알림
    this.server.to(roomId).emit(SERVER_EVENTS.PLAYER_LEFT, {
      playerId: playerInfo.playerId,
      nickname: player.nickname,
      playerCount: room.players.length,
    });

    // 생존자 수 확인
    const alivePlayers = room.players.filter(p => p.isAlive);

    // 1명만 남으면 게임 종료
    if (alivePlayers.length <= 1) {
      room.status = 'finished';
      const winner = alivePlayers[0];
      if (winner) {
        room.winnerId = winner.id;
        this.server.to(roomId).emit(SERVER_EVENTS.GAME_ENDED, {
          winnerId: winner.id,
          winnerNickname: winner.nickname,
        });
      }
      return { success: true };
    }

    // 해당 플레이어 턴이었으면 다음 턴으로
    if (wasAlive && room.currentTurnPlayerId === playerInfo.playerId) {
      const sortedAlive = alivePlayers.sort((a, b) => a.order - b.order);
      const currentIdx = sortedAlive.findIndex(p => p.order > (player.order ?? 0));
      const nextPlayer = currentIdx >= 0 ? sortedAlive[currentIdx] : sortedAlive[0];

      if (nextPlayer) {
        room.currentTurnPlayerId = nextPlayer.id;

        this.server.to(roomId).emit(SERVER_EVENTS.TURN_CHANGED, {
          currentPlayerId: nextPlayer.id,
          currentBet: room.currentBet
            ? {
                playerId: room.currentBet.playerId,
                diceValue: room.currentBet.diceValue,
                diceCount: room.currentBet.diceCount,
              }
            : null,
        });
      }
    }

    return { success: true };
  }

  /**
   * 게임 리셋 (대기방으로 복귀)
   */
  @SubscribeMessage('game:reset')
  handleGameReset(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string }
  ): { success: boolean; error?: string } {
    const { roomId } = payload;
    const playerInfo = this.socketPlayerMap.get(client.id);

    if (!playerInfo || playerInfo.roomId !== roomId) {
      return { success: false, error: 'INVALID_ROOM' };
    }

    const engine = this.roomsService.getGameEngine(roomId);
    if (!engine) {
      return { success: false, error: 'ROOM_NOT_FOUND' };
    }

    const room = engine.getRoom();

    // 게임이 종료된 상태에서만 리셋 가능
    if (room.status !== 'finished') {
      return { success: false, error: 'GAME_NOT_FINISHED' };
    }

    // 게임 리셋
    engine.resetGame();

    // 모든 플레이어에게 리셋 알림
    this.server.to(roomId).emit('game:reset', {
      players: room.players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        diceCount: p.diceCount,
        order: p.order,
        isAlive: p.isAlive,
        isReady: p.isReady,
      })),
      hostId: room.hostId,
    });

    return { success: true };
  }
}
