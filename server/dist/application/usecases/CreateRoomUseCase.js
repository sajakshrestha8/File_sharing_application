"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRoomUseCase = void 0;
const crypto_1 = require("crypto");
class CreateRoomUseCase {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }
    async execute(input) {
        const createdRoomId = (0, crypto_1.randomUUID)();
        await this.roomRepository.addRoom(createdRoomId);
        await this.roomRepository.addMember(createdRoomId, input.socketId);
        return {
            roomId: createdRoomId,
            message: "Room created successfully",
        };
    }
}
exports.CreateRoomUseCase = CreateRoomUseCase;
