"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsGateway = void 0;
const crypto_1 = require("crypto");
class WsGateway {
    constructor(deps) {
        this.deps = deps;
        this.handleConnection = (ws) => {
            const socket = ws;
            socket.id = (0, crypto_1.randomUUID)();
            this.deps.socketRegistry.register(socket.id, ws);
            console.log(`Connected: ${socket.id} | Total: ${this.deps.socketRegistry.size()}`);
            ws.on("close", async () => {
                console.log(`Disconnected: ${socket.id}`);
                try {
                    const allRooms = await this.deps.roomMembershipRepository.getAllRooms();
                    for (const roomId of allRooms) {
                        await this.deps.roomMembershipRepository.removeMember(roomId, socket.id);
                    }
                }
                catch (error) {
                    console.error("Redis cleanup error:", error);
                }
                finally {
                    this.deps.socketRegistry.remove(socket.id);
                }
            });
            ws.on("message", async (data, isBinary) => {
                if (isBinary) {
                    console.warn("Binary message received - ignored (use HTTP upload)");
                    return;
                }
                const text = typeof data === "string" ? data : data.toString("utf8");
                let message;
                try {
                    message = JSON.parse(text);
                }
                catch (e) {
                    console.error("Failed to parse message:", e);
                    return;
                }
                if (!message?.type)
                    return;
                console.log(`[${message.type}] from ${socket.id}`);
                try {
                    switch (message.type) {
                        case "createRoom": {
                            const output = await this.deps.createRoomUseCase.execute({
                                socketId: socket.id,
                            });
                            const event = {
                                type: "room-created",
                                roomId: output.roomId,
                                message: output.message,
                            };
                            this.sendToSocket(socket.id, event);
                            return;
                        }
                        case "join": {
                            const roomId = message.roomId;
                            if (!roomId) {
                                const errEvent = {
                                    type: "error",
                                    message: "roomId is required",
                                };
                                this.sendToSocket(socket.id, errEvent);
                                return;
                            }
                            const output = await this.deps.joinRoomUseCase.execute({
                                socketId: socket.id,
                                roomId,
                            });
                            const event = {
                                type: "join-ack",
                                roomId: output.roomId,
                                message: output.message,
                            };
                            this.sendToSocket(socket.id, event);
                            return;
                        }
                        case "message": {
                            const roomId = message.roomId;
                            if (!roomId) {
                                const errEvent = {
                                    type: "error",
                                    message: "roomId is required",
                                };
                                this.sendToSocket(socket.id, errEvent);
                                return;
                            }
                            const relayMessage = message.message;
                            await this.deps.relayMessageUseCase.execute({
                                socketId: socket.id,
                                roomId,
                                message: relayMessage ?? "",
                            });
                            return;
                        }
                        default: {
                            console.warn(`Unknown message type: ${message.type}`);
                        }
                    }
                }
                catch (error) {
                    console.error("WS handler error:", error);
                }
            });
        };
    }
    sendToSocket(socketId, event) {
        const socket = this.deps.socketRegistry.get(socketId);
        if (!socket)
            return;
        if (socket.readyState !== 1 /* WebSocket.OPEN */)
            return;
        socket.send(JSON.stringify(event));
    }
}
exports.WsGateway = WsGateway;
