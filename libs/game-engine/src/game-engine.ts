/**
 * 게임 엔진
 * 게임 상태 관리 및 전체 게임 흐름 제어
 */

import type { GameStatus, ChallengeResult } from '@pirate-dice/types';
import type { GameRoom, Player, Bet } from '@pirate-dice/entities';
import { createPlayer, createGameRoom } from '@pirate-dice/entities';
import { INITIAL_DICE_COUNT, GAME_CONFIG } from '@pirate-dice/constants';
import { compareDiceForOrder, rollDice, calculateRemainingDice, isEliminated } from '@pirate-dice/services';
import { RoundManager } from './round-manager';
import { TurnManager } from './turn-manager';

/**
 * 게임 이벤트 타입
 */
export type GameEvent =
  | { type: 'PLAYER_JOINED'; playerId: string; nickname: string }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'GAME_STARTED'; players: Player[]; firstPlayerId: string }
  | { type: 'ROUND_STARTED'; round: number; playerDice: Record<string, number[]> }
  | { type: 'BET_PLACED'; bet: Bet }
  | { type: 'TURN_CHANGED'; playerId: string }
  | { type: 'CHALLENGE_RESULT'; result: ChallengeResult }
  | { type: 'PLAYER_ELIMINATED'; playerId: string }
  | { type: 'GAME_ENDED'; winnerId: string };

/**
 * 게임 이벤트 리스너
 */
export type GameEventListener = (event: GameEvent) => void;

/**
 * 게임 엔진 클래스
 */
export class GameEngine {
  private room: GameRoom;
  private roundManager: RoundManager;
  private turnManager: TurnManager;
  private eventListeners: GameEventListener[] = [];

  constructor(roomId: string, hostId: string) {
    this.room = createGameRoom({ id: roomId, hostId });
    this.roundManager = new RoundManager();
    this.turnManager = new TurnManager();
  }

  /**
   * 이벤트 리스너 등록
   */
  addEventListener(listener: GameEventListener): void {
    this.eventListeners.push(listener);
  }

  /**
   * 이벤트 발행
   */
  private emit(event: GameEvent): void {
    for (const listener of this.eventListeners) {
      listener(event);
    }
  }

  /**
   * 게임방 정보 가져오기
   */
  getRoom(): GameRoom {
    return this.room;
  }

  /**
   * 게임 상태 가져오기
   */
  getStatus(): GameStatus {
    return this.room.status;
  }

  /**
   * 플레이어 입장
   */
  addPlayer(playerId: string, nickname: string): Player | null {
    if (this.room.status !== 'waiting') {
      return null;
    }

    if (this.room.players.length >= this.room.maxPlayers) {
      return null;
    }

    if (this.room.players.some(p => p.id === playerId)) {
      return null;
    }

    const player = createPlayer({ id: playerId, nickname }, 0);
    this.room.players.push(player);

    this.emit({ type: 'PLAYER_JOINED', playerId, nickname });

    return player;
  }

  /**
   * 플레이어 퇴장
   */
  removePlayer(playerId: string): boolean {
    const index = this.room.players.findIndex(p => p.id === playerId);
    if (index === -1) {
      return false;
    }

    this.room.players.splice(index, 1);

    // 방장이 나가면 다음 플레이어가 방장
    if (this.room.hostId === playerId && this.room.players.length > 0) {
      this.room.hostId = this.room.players[0]!.id;
    }

    this.emit({ type: 'PLAYER_LEFT', playerId });

    return true;
  }

  /**
   * 플레이어 준비 상태 변경
   */
  setPlayerReady(playerId: string, isReady: boolean): boolean {
    const player = this.room.players.find(p => p.id === playerId);
    if (!player) {
      return false;
    }

    player.isReady = isReady;
    return true;
  }

  /**
   * 게임 시작 가능 여부 확인
   */
  canStartGame(): boolean {
    if (this.room.status !== 'waiting') {
      return false;
    }

    if (this.room.players.length < GAME_CONFIG.MIN_PLAYERS) {
      return false;
    }

    return this.room.players.every(p => p.isReady);
  }

  /**
   * 게임 시작
   */
  startGame(): boolean {
    if (!this.canStartGame()) {
      return false;
    }

    this.room.status = 'playing';
    const playerCount = this.room.players.length;
    const initialDice = INITIAL_DICE_COUNT[playerCount] ?? 5;

    // 순서 결정을 위한 주사위 굴림
    const orderRolls: Array<{ playerId: string; dice: number[] }> = [];
    for (const player of this.room.players) {
      player.diceCount = initialDice;
      player.isAlive = true;
      const dice = rollDice(initialDice);
      orderRolls.push({ playerId: player.id, dice });
    }

    // 순서 정렬 (높은 눈 순)
    orderRolls.sort((a, b) => compareDiceForOrder(a.dice, b.dice));

    // 순서 할당
    for (let i = 0; i < orderRolls.length; i++) {
      const player = this.room.players.find(p => p.id === orderRolls[i]!.playerId);
      if (player) {
        player.order = i;
      }
    }

    // 턴 관리자 초기화
    this.turnManager.setPlayers(this.room.players);
    const firstPlayer = this.turnManager.getCurrentPlayer();

    if (firstPlayer) {
      this.room.currentTurnPlayerId = firstPlayer.id;
    }

    this.emit({
      type: 'GAME_STARTED',
      players: this.room.players,
      firstPlayerId: firstPlayer?.id ?? '',
    });

    // 첫 라운드 시작
    this.startNewRound();

    return true;
  }

  /**
   * 새 라운드 시작
   */
  private startNewRound(): void {
    const firstBettorId = this.room.currentTurnPlayerId;
    if (!firstBettorId) {
      return;
    }

    const alivePlayers = this.room.players.filter(p => p.isAlive);

    // 턴 관리자에 생존 플레이어 목록 갱신
    this.turnManager.updateAlivePlayers(this.room.players);
    this.turnManager.setCurrentPlayer(firstBettorId);

    const round = this.roundManager.startNewRound(firstBettorId, alivePlayers);

    this.room.currentRound = round.roundNumber;
    this.room.currentBet = null;

    // 플레이어에게 주사위 할당
    for (const player of alivePlayers) {
      player.currentDice = round.playerDice[player.id] ?? [];
    }

    this.emit({
      type: 'ROUND_STARTED',
      round: round.roundNumber,
      playerDice: round.playerDice,
    });
  }

  /**
   * 베팅 처리
   */
  placeBet(playerId: string, diceValue: number, diceCount: number): boolean {
    if (this.room.status !== 'playing') {
      return false;
    }

    if (this.room.currentTurnPlayerId !== playerId) {
      return false;
    }

    const bet = this.roundManager.placeBet(playerId, diceValue, diceCount);
    if (!bet) {
      return false;
    }

    this.room.currentBet = bet;

    this.emit({ type: 'BET_PLACED', bet });

    // 다음 턴으로
    this.advanceTurn();

    return true;
  }

  /**
   * 도전 처리
   */
  challenge(challengerId: string): ChallengeResult | null {
    if (this.room.status !== 'playing') {
      return null;
    }

    if (this.room.currentTurnPlayerId !== challengerId) {
      return null;
    }

    // 첫 턴에는 도전 불가
    if (this.roundManager.isFirstTurn()) {
      return null;
    }

    const alivePlayerIds = this.turnManager.getAlivePlayerIds();
    const result = this.roundManager.processChallenge(challengerId, alivePlayerIds);

    if (!result) {
      return null;
    }

    this.emit({ type: 'CHALLENGE_RESULT', result });

    // 주사위 손실 처리
    this.processDiceLoss(result);

    // 다음 라운드 또는 게임 종료
    this.handlePostChallenge(challengerId);

    return result;
  }

  /**
   * 주사위 손실 처리
   */
  private processDiceLoss(result: ChallengeResult): void {
    for (const playerId of result.loserPlayerIds) {
      const player = this.room.players.find(p => p.id === playerId);
      if (player) {
        const remaining = calculateRemainingDice(playerId, player.diceCount, result);
        const lost = player.diceCount - remaining;

        player.diceCount = remaining;
        this.room.discardedDice += lost;

        if (isEliminated(remaining)) {
          player.isAlive = false;
          this.emit({ type: 'PLAYER_ELIMINATED', playerId });
        }
      }
    }

    // 턴 관리자 갱신
    this.turnManager.updateAlivePlayers(this.room.players);
  }

  /**
   * 도전 후 처리 (다음 라운드 또는 게임 종료)
   */
  private handlePostChallenge(challengerId: string): void {
    const aliveCount = this.turnManager.getAlivePlayerCount();

    // 승리 조건 확인
    if (aliveCount <= 1) {
      this.endGame();
      return;
    }

    // 다음 라운드 첫 베팅자 결정
    // 도전자가 생존해 있으면 도전자, 아니면 다음 플레이어
    const challenger = this.room.players.find(p => p.id === challengerId);
    let nextFirstBettor: Player | null;

    if (challenger?.isAlive) {
      nextFirstBettor = challenger;
    } else {
      nextFirstBettor = this.turnManager.getNextPlayerAfter(challengerId);
    }

    if (nextFirstBettor) {
      this.room.currentTurnPlayerId = nextFirstBettor.id;
      this.turnManager.setCurrentPlayer(nextFirstBettor.id);
    }

    // 다음 라운드 시작
    this.startNewRound();
  }

  /**
   * 턴 진행
   */
  private advanceTurn(): void {
    const nextPlayer = this.turnManager.nextTurn();
    if (nextPlayer) {
      this.room.currentTurnPlayerId = nextPlayer.id;
      this.emit({ type: 'TURN_CHANGED', playerId: nextPlayer.id });
    }
  }

  /**
   * 게임 종료
   */
  private endGame(): void {
    this.room.status = 'finished';

    const winner = this.room.players.find(p => p.isAlive);
    if (winner) {
      this.room.winnerId = winner.id;
      this.emit({ type: 'GAME_ENDED', winnerId: winner.id });
    }
  }

  /**
   * 플레이어의 주사위 가져오기 (해당 플레이어에게만 공개)
   */
  getPlayerDice(playerId: string): number[] {
    return this.roundManager.getPlayerDice(playerId);
  }

  /**
   * 현재 베팅 가져오기
   */
  getCurrentBet(): Bet | null {
    return this.room.currentBet;
  }

  /**
   * 현재 턴 플레이어 ID 가져오기
   */
  getCurrentTurnPlayerId(): string | null {
    return this.room.currentTurnPlayerId;
  }
}
