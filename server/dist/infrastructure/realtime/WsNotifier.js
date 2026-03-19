"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsNotifier = void 0;
class WsNotifier {
    constructor(roomMembershipRepository, socketRegistry) {
        this.roomMembershipRepository = roomMembershipRepository;
        this.socketRegistry = socketRegistry;
    }
    async notifyRoom(roomId, event) {
        const members = await this.roomMembershipRepository.getMembers(roomId);
        for (const socketId of members) {
            const socket = this.socketRegistry.get(socketId);
            if (!socket)
                continue;
            // `ws` instances have `send` and `readyState`. We keep the type as `unknown`
            // in the domain layer to avoid leaking infrastructure details.
            const ws = socket;
            if (ws.readyState !== 1 /* WebSocket.OPEN */)
                continue;
            ws.send(JSON.stringify(event));
        }
    }
}
exports.WsNotifier = WsNotifier;
