"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayMessageUseCase = void 0;
class RelayMessageUseCase {
    constructor(roomRepository, websocketNotifier) {
        this.roomRepository = roomRepository;
        this.websocketNotifier = websocketNotifier;
    }
    async execute(input) {
        if (!input.roomId) {
            throw new Error("roomId is required");
        }
        // Keep `roomRepository` dependency here to preserve the same semantics
        // as the current implementation (only relay if members exist).
        const members = await this.roomRepository.getMembers(input.roomId);
        if (members.length === 0)
            return;
        const event = {
            type: "message",
            message: input.message,
            from: input.socketId,
        };
        await this.websocketNotifier.notifyRoom(input.roomId, event);
    }
}
exports.RelayMessageUseCase = RelayMessageUseCase;
