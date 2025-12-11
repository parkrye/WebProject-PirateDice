/**
 * 게임방 REST API 컨트롤러
 */

import { Controller, Get, Post, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import type { PublicGameRoomInfo } from '@pirate-dice/entities';

/**
 * 게임방 생성 요청 DTO
 */
interface CreateRoomDto {
  hostId: string;
  hostNickname: string;
  maxPlayers?: number;
}

/**
 * 게임방 참가 요청 DTO
 */
interface JoinRoomDto {
  playerId: string;
  nickname: string;
}

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  /**
   * 게임방 목록 조회
   */
  @Get()
  getRooms(): PublicGameRoomInfo[] {
    return this.roomsService.getPublicRoomList();
  }

  /**
   * 게임방 상세 조회
   */
  @Get(':id')
  getRoom(@Param('id') id: string) {
    const room = this.roomsService.getRoom(id);
    if (!room) {
      throw new HttpException('게임방을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
    return room;
  }

  /**
   * 게임방 생성
   */
  @Post()
  createRoom(@Body() dto: CreateRoomDto) {
    const room = this.roomsService.createRoom(dto.hostId, dto.hostNickname, dto.maxPlayers);
    return { roomId: room.id, room };
  }

  /**
   * 게임방 참가
   */
  @Post(':id/join')
  joinRoom(@Param('id') id: string, @Body() dto: JoinRoomDto) {
    const result = this.roomsService.joinRoom(id, dto.playerId, dto.nickname);
    if (!result.success) {
      throw new HttpException(result.error ?? '참가 실패', HttpStatus.BAD_REQUEST);
    }
    return { success: true, room: result.room };
  }

  /**
   * 게임방 퇴장
   */
  @Post(':id/leave')
  leaveRoom(@Param('id') id: string, @Body() dto: { playerId: string }) {
    const result = this.roomsService.leaveRoom(id, dto.playerId);
    if (!result) {
      throw new HttpException('퇴장 실패', HttpStatus.BAD_REQUEST);
    }
    return { success: true };
  }
}
