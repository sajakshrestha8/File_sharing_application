import type { RoomMembershipRepository } from "../../domain/interfaces/RoomMembershipRepository";

export class RedisRoomMembershipRepository implements RoomMembershipRepository {
  constructor(private readonly redisClient: any) {}

  async addRoom(roomId: string): Promise<void> {
    await this.redisClient.sAdd("rooms", roomId);
  }

  async addMember(roomId: string, socketId: string): Promise<void> {
    await this.redisClient.sAdd(`room:${roomId}`, socketId);
  }

  async removeMember(roomId: string, socketId: string): Promise<void> {
    await this.redisClient.sRem(`room:${roomId}`, socketId);
  }

  async getMembers(roomId: string): Promise<string[]> {
    const members = await this.redisClient.sMembers(`room:${roomId}`);
    return members as string[];
  }

  async getAllRooms(): Promise<string[]> {
    const rooms = await this.redisClient.sMembers("rooms");
    return rooms as string[];
  }
}

