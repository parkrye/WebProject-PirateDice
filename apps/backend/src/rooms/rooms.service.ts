/**
 * 게임방 관리 서비스
 */

import { Injectable } from '@nestjs/common';
import type { GameRoom, Player, PublicGameRoomInfo } from '@pirate-dice/entities';
import { createGameRoom, createPlayer } from '@pirate-dice/entities';
import { INITIAL_DICE_COUNT, ROOM_CONFIG, GAME_CONFIG } from '@pirate-dice/constants';
import { GameEngine } from '@pirate-dice/game-engine';

/**
 * 게임방 참가 결과
 */
interface JoinRoomResult {
  success: boolean;
  error?: string;
  room?: GameRoom;
  player?: Player;
}

@Injectable()
export class RoomsService {
  /** 게임방 저장소 (roomId -> GameEngine) */
  private rooms: Map<string, GameEngine> = new Map();

  /**
   * 랜덤 방 ID 생성
   */
  private generateRoomId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < ROOM_CONFIG.ROOM_ID_LENGTH; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 게임방 생성
   */
  createRoom(hostId: string, hostNickname: string, maxPlayers?: number): GameRoom {
    let roomId = this.generateRoomId();

    // 중복 ID 방지
    while (this.rooms.has(roomId)) {
      roomId = this.generateRoomId();
    }

    const engine = new GameEngine(roomId, hostId);
    const room = engine.getRoom();

    if (maxPlayers && maxPlayers >= GAME_CONFIG.MIN_PLAYERS && maxPlayers <= GAME_CONFIG.MAX_PLAYERS) {
      room.maxPlayers = maxPlayers;
    }

    // 방장을 첫 플레이어로 추가
    engine.addPlayer(hostId, hostNickname);

    this.rooms.set(roomId, engine);

    return room;
  }

  /**
   * 게임방 조회
   */
  getRoom(roomId: string): GameRoom | null {
    const engine = this.rooms.get(roomId);
    return engine?.getRoom() ?? null;
  }

  /**
   * 게임 엔진 조회
   */
  getGameEngine(roomId: string): GameEngine | null {
    return this.rooms.get(roomId) ?? null;
  }

  /**
   * 공개 게임방 목록 조회
   */
  getPublicRoomList(): PublicGameRoomInfo[] {
    const publicRooms: PublicGameRoomInfo[] = [];

    for (const engine of this.rooms.values()) {
      const room = engine.getRoom();

      // 대기 중인 방만 표시
      if (room.status !== 'waiting') {
        continue;
      }

      const host = room.players.find(p => p.id === room.hostId);

      publicRooms.push({
        id: room.id,
        hostNickname: host?.nickname ?? 'Unknown',
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        status: room.status,
      });
    }

    return publicRooms;
  }

  /**
   * 게임방 참가
   */
  joinRoom(roomId: string, playerId: string, nickname: string): JoinRoomResult {
    const engine = this.rooms.get(roomId);

    if (!engine) {
      return { success: false, error: '게임방을 찾을 수 없습니다.' };
    }

    const room = engine.getRoom();

    if (room.status !== 'waiting') {
      return { success: false, error: '게임이 이미 시작되었습니다.' };
    }

    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: '게임방이 가득 찼습니다.' };
    }

    const player = engine.addPlayer(playerId, nickname);

    if (!player) {
      return { success: false, error: '참가에 실패했습니다.' };
    }

    return { success: true, room: engine.getRoom(), player };
  }

  /**
   * 게임방 퇴장
   */
  leaveRoom(roomId: string, playerId: string): boolean {
    const engine = this.rooms.get(roomId);

    if (!engine) {
      return false;
    }

    const result = engine.removePlayer(playerId);

    // 플레이어가 없으면 방 삭제
    const room = engine.getRoom();
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
    }

    return result;
  }

  /**
   * 게임방 삭제
   */
  deleteRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }
}
