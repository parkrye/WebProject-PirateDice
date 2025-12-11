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
import { ERROR_MESSAGES } from '@pirate-dice/constants';

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
      // 방에서 플레이어 제거 또는 연결 끊김 상태로 변경
      const engine = this.roomsService.getGameEngine(playerInfo.roomId);
      if (engine) {
        const room = engine.getRoom();

        // 게임 중이 아니면 퇴장 처리
        if (room.status === 'waiting') {
          this.roomsService.leaveRoom(playerInfo.roomId, playerInfo.playerId);

          // 다른 플레이어들에게 알림
          this.server.to(playerInfo.roomId).emit(SERVER_EVENTS.PLAYER_LEFT, {
            playerId: playerInfo.playerId,
            playerCount: room.players.length,
          });
        }
      }

      this.socketPlayerMap.delete(client.id);
    }
  }

  /**
   * 방 참가 (소켓 룸 조인)
   */
  @SubscribeMessage('room:join')
  handleRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; playerId: string }
  ) {
    const { roomId, playerId } = payload;

    const room = this.roomsService.getRoom(roomId);
    if (!room) {
      client.emit(SERVER_EVENTS.ERROR, {
        code: 'ROOM_NOT_FOUND',
        message: ERROR_MESSAGES.ROOM_NOT_FOUND,
      });
      return;
    }

    // 소켓 룸 참가
    client.join(roomId);
    this.socketPlayerMap.set(client.id, { playerId, roomId });

    // 입장 알림 - 전체 플레이어 목록 포함
    const player = room.players.find(p => p.id === playerId);
    if (player) {
      this.server.to(roomId).emit(SERVER_EVENTS.PLAYER_JOINED, {
        playerId,
        nickname: player.nickname,
        playerCount: room.players.length,
        players: room.players.map(p => ({
          id: p.id,
          nickname: p.nickname,
          diceCount: p.diceCount,
          order: p.order,
          isAlive: p.isAlive,
          isReady: p.isReady,
        })),
      });
    }

    return { success: true, room };
  }

  /**
   * 게임 준비 완료
   */
  @SubscribeMessage(CLIENT_EVENTS.GAME_READY)
  handleGameReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: GameReadyPayload
  ) {
    const { roomId } = payload;
    const playerInfo = this.socketPlayerMap.get(client.id);

    if (!playerInfo || playerInfo.roomId !== roomId) {
      client.emit(SERVER_EVENTS.ERROR, {
        code: 'INVALID_ROOM',
        message: '잘못된 게임방입니다.',
      });
      return;
    }

    const engine = this.roomsService.getGameEngine(roomId);
    if (!engine) {
      return;
    }

    // 준비 상태 변경
    engine.setPlayerReady(playerInfo.playerId, true);

    // 모든 플레이어에게 준비 상태 변경 알림
    this.server.to(roomId).emit('player:ready', {
      playerId: playerInfo.playerId,
      isReady: true,
    });

    // 모두 준비되면 게임 시작 가능 알림
    if (engine.canStartGame()) {
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

    // 베팅 알림
    this.server.to(roomId).emit(SERVER_EVENTS.TURN_CHANGED, {
      currentPlayerId: room.currentTurnPlayerId,
      currentBet: currentBet
        ? {
            playerId: currentBet.playerId,
            diceValue: currentBet.diceValue,
            diceCount: currentBet.diceCount,
          }
        : null,
    });

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

    const engine = this.roomsService.getGameEngine(roomId);
    if (!engine) {
      return;
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

    const room = engine.getRoom();

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
          const dice = engine.getPlayerDice(info.playerId);
          this.server.to(socketId).emit(SERVER_EVENTS.ROUND_STARTED, {
            round: room.currentRound,
            yourDice: dice,
          });
        }
      }
    }

    return { success: true };
  }
}
