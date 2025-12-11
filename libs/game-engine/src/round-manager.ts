/**
 * 라운드 관리자
 * 라운드 진행 및 상태 관리
 */

import type { RoundPhase, ChallengeResult } from '@pirate-dice/types';
import type { Round, Bet, Player } from '@pirate-dice/entities';
import { createRound, createBet } from '@pirate-dice/entities';
import { rollDice, validateBet, judgeChallenge } from '@pirate-dice/services';

/**
 * 라운드 관리자 클래스
 */
export class RoundManager {
  private currentRound: Round | null = null;
  private roundNumber: number = 0;

  /**
   * 새 라운드 시작
   * @param firstBettorId 첫 베팅자 ID
   * @param players 생존 플레이어 목록
   * @returns 생성된 라운드
   */
  startNewRound(firstBettorId: string, players: Player[]): Round {
    this.roundNumber++;
    this.currentRound = createRound(this.roundNumber, firstBettorId);

    // 모든 플레이어 주사위 굴림
    for (const player of players) {
      if (player.isAlive) {
        this.currentRound.playerDice[player.id] = rollDice(player.diceCount);
      }
    }

    this.currentRound.phase = 'betting';
    return this.currentRound;
  }

  /**
   * 현재 라운드 가져오기
   */
  getCurrentRound(): Round | null {
    return this.currentRound;
  }

  /**
   * 현재 라운드 번호 가져오기
   */
  getRoundNumber(): number {
    return this.roundNumber;
  }

  /**
   * 플레이어의 주사위 가져오기
   */
  getPlayerDice(playerId: string): number[] {
    return this.currentRound?.playerDice[playerId] ?? [];
  }

  /**
   * 현재 베팅 가져오기
   */
  getCurrentBet(): Bet | null {
    if (!this.currentRound || this.currentRound.bets.length === 0) {
      return null;
    }
    return this.currentRound.bets[this.currentRound.bets.length - 1] ?? null;
  }

  /**
   * 베팅 처리
   * @param playerId 베팅 플레이어 ID
   * @param diceValue 주사위 눈
   * @param diceCount 개수
   * @returns 성공 시 생성된 베팅, 실패 시 null
   */
  placeBet(playerId: string, diceValue: number, diceCount: number): Bet | null {
    if (!this.currentRound || this.currentRound.phase !== 'betting') {
      return null;
    }

    const previousBet = this.getCurrentBet();
    const validation = validateBet(previousBet, diceValue, diceCount);

    if (!validation.isValid) {
      return null;
    }

    const newBet = createBet({ playerId, diceValue, diceCount });
    this.currentRound.bets.push(newBet);

    return newBet;
  }

  /**
   * 도전 처리
   * @param challengerId 도전자 ID
   * @param alivePlayerIds 모든 생존 플레이어 ID
   * @returns 판정 결과
   */
  processChallenge(challengerId: string, alivePlayerIds: string[]): ChallengeResult | null {
    if (!this.currentRound || this.currentRound.phase !== 'betting') {
      return null;
    }

    const currentBet = this.getCurrentBet();
    if (!currentBet) {
      return null;
    }

    this.currentRound.phase = 'challenging';
    this.currentRound.challengerId = challengerId;

    const result = judgeChallenge({
      allPlayerDice: this.currentRound.playerDice,
      currentBet,
      challengerId,
      alivePlayerIds,
    });

    this.currentRound.challengeResult = result;
    this.currentRound.phase = 'finished';

    return result;
  }

  /**
   * 라운드가 첫 턴인지 확인 (도전 불가능)
   */
  isFirstTurn(): boolean {
    return !this.currentRound || this.currentRound.bets.length === 0;
  }

  /**
   * 라운드 종료 처리
   */
  endRound(): void {
    if (this.currentRound) {
      this.currentRound.phase = 'finished';
    }
  }

  /**
   * 라운드 상태 초기화
   */
  reset(): void {
    this.currentRound = null;
    this.roundNumber = 0;
  }
}
