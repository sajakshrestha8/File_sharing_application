"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisRoomMembershipRepository = void 0;
class RedisRoomMembershipRepository {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    async addRoom(roomId) {
        await this.redisClient.sAdd("rooms", roomId);
    }
    async addMember(roomId, socketId) {
        await this.redisClient.sAdd(`room:${roomId}`, socketId);
    }
    async removeMember(roomId, socketId) {
        await this.redisClient.sRem(`room:${roomId}`, socketId);
    }
    async getMembers(roomId) {
        const members = await this.redisClient.sMembers(`room:${roomId}`);
        return members;
    }
    async getAllRooms() {
        const rooms = await this.redisClient.sMembers("rooms");
        return rooms;
    }
}
exports.RedisRoomMembershipRepository = RedisRoomMembershipRepository;
