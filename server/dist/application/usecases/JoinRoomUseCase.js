"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinRoomUseCase = void 0;
class JoinRoomUseCase {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }
    async execute(input) {
        if (!input.roomId) {
            throw new Error("roomId is required");
        }
        await this.roomRepository.addMember(input.roomId, input.socketId);
        return {
            roomId: input.roomId,
            message: "Joined room successfully",
        };
    }
}
exports.JoinRoomUseCase = JoinRoomUseCase;
