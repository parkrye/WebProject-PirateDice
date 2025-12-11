/**
 * 턴 관리자
 * 플레이어 턴 순서 관리
 */

import type { Player } from '@pirate-dice/entities';

/**
 * 턴 관리자 클래스
 */
export class TurnManager {
  private players: Player[] = [];
  private currentTurnIndex: number = 0;

  /**
   * 플레이어 목록 설정 (순서대로 정렬되어 있어야 함)
   */
  setPlayers(players: Player[]): void {
    this.players = players.filter(p => p.isAlive).sort((a, b) => a.order - b.order);
    this.currentTurnIndex = 0;
  }

  /**
   * 생존 플레이어 목록 갱신
   */
  updateAlivePlayers(players: Player[]): void {
    this.players = players.filter(p => p.isAlive).sort((a, b) => a.order - b.order);

    // 현재 턴 인덱스가 범위를 벗어나면 조정
    if (this.currentTurnIndex >= this.players.length) {
      this.currentTurnIndex = 0;
    }
  }

  /**
   * 현재 턴 플레이어 가져오기
   */
  getCurrentPlayer(): Player | null {
    if (this.players.length === 0) {
      return null;
    }
    return this.players[this.currentTurnIndex] ?? null;
  }

  /**
   * 현재 턴 플레이어 ID 가져오기
   */
  getCurrentPlayerId(): string | null {
    return this.getCurrentPlayer()?.id ?? null;
  }

  /**
   * 다음 플레이어로 턴 이동
   */
  nextTurn(): Player | null {
    if (this.players.length === 0) {
      return null;
    }

    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
    return this.getCurrentPlayer();
  }

  /**
   * 특정 플레이어로 턴 설정
   */
  setCurrentPlayer(playerId: string): boolean {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index === -1) {
      return false;
    }

    this.currentTurnIndex = index;
    return true;
  }

  /**
   * 특정 플레이어의 다음 생존 플레이어 찾기
   * (해당 플레이어가 탈락한 경우 다음 첫 베팅자 결정에 사용)
   */
  getNextPlayerAfter(playerId: string): Player | null {
    const currentIndex = this.players.findIndex(p => p.id === playerId);
    if (currentIndex === -1) {
      // 해당 플레이어가 없으면 (탈락) 첫 번째 플레이어 반환
      return this.players[0] ?? null;
    }

    const nextIndex = (currentIndex + 1) % this.players.length;
    return this.players[nextIndex] ?? null;
  }

  /**
   * 생존 플레이어 수 가져오기
   */
  getAlivePlayerCount(): number {
    return this.players.length;
  }

  /**
   * 모든 생존 플레이어 ID 가져오기
   */
  getAlivePlayerIds(): string[] {
    return this.players.map(p => p.id);
  }

  /**
   * 첫 번째 턴으로 리셋
   */
  reset(): void {
    this.currentTurnIndex = 0;
  }
}
