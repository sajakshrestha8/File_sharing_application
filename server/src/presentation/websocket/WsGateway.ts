import { randomUUID } from "crypto";
import type { WebSocket } from "ws";

import type { SocketRegistry } from "../../domain/interfaces/SocketRegistry";
import type { RoomMembershipRepository } from "../../domain/interfaces/RoomMembershipRepository";
import type { CreateRoomUseCase } from "../../application/usecases/CreateRoomUseCase";
import type { JoinRoomUseCase } from "../../application/usecases/JoinRoomUseCase";
import type { RelayMessageUseCase } from "../../application/usecases/RelayMessageUseCase";
import type { WsClientCommand } from "../../domain/ws/WsCommands";
import type {
  WsServerEvent,
  RoomCreatedEvent,
  JoinAckEvent,
  ErrorEvent,
} from "../../domain/ws/WsEvents";

type WsWithId = WebSocket & { id: string };

export type WsGatewayDeps = {
  socketRegistry: SocketRegistry;
  roomMembershipRepository: RoomMembershipRepository;
  createRoomUseCase: CreateRoomUseCase;
  joinRoomUseCase: JoinRoomUseCase;
  relayMessageUseCase: RelayMessageUseCase;
};

export class WsGateway {
  constructor(private readonly deps: WsGatewayDeps) {}

  public handleConnection = (ws: WebSocket) => {
    const socket = ws as WsWithId;
    socket.id = randomUUID();

    this.deps.socketRegistry.register(socket.id, ws);

    ws.on("close", async () => {
      try {
        const allRooms = await this.deps.roomMembershipRepository.getAllRooms();
        for (const roomId of allRooms) {
          await this.deps.roomMembershipRepository.removeMember(roomId, socket.id);
        }
      } catch (error) {
        console.error("Redis cleanup error:", error);
      } finally {
        this.deps.socketRegistry.remove(socket.id);
      }
    });

    ws.on("message", async (data, isBinary) => {
      if (isBinary) {
        console.warn("Binary message received - ignored (use HTTP upload)");
        return;
      }

      const text = typeof data === "string" ? data : data.toString("utf8");

      let message: WsClientCommand;
      try {
        message = JSON.parse(text) as WsClientCommand;
      } catch (e) {
        console.error("Failed to parse message:", e);
        return;
      }

      if (!message?.type) return;

      try {
        switch (message.type) {
          case "createRoom": {
            const output = await this.deps.createRoomUseCase.execute({
              socketId: socket.id,
            });

            const event: RoomCreatedEvent = {
              type: "room-created",
              roomId: output.roomId,
              message: output.message,
            };

            this.sendToSocket(socket.id, event);
            return;
          }

          case "join": {
            const roomId = (message as any).roomId as string | undefined;
            if (!roomId) {
              const errEvent: ErrorEvent = {
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

            const event: JoinAckEvent = {
              type: "join-ack",
              roomId: output.roomId,
              message: output.message,
            };

            this.sendToSocket(socket.id, event);
            return;
          }

          case "message": {
            const roomId = (message as any).roomId as string | undefined;
            if (!roomId) {
              const errEvent: ErrorEvent = {
                type: "error",
                message: "roomId is required",
              };
              this.sendToSocket(socket.id, errEvent);
              return;
            }

            const relayMessage = (message as any).message as string | undefined;
            await this.deps.relayMessageUseCase.execute({
              socketId: socket.id,
              roomId,
              message: relayMessage ?? "",
            });
            return;
          }

          default: {
            console.warn(`Unknown message type: ${(message as any).type}`);
          }
        }
      } catch (error) {
        console.error("WS handler error:", error);
      }
    });
  };

  private sendToSocket(socketId: string, event: WsServerEvent) {
    const socket = this.deps.socketRegistry.get(socketId) as
      | (WebSocket & { readyState: number; send: (data: string) => void })
      | undefined;
    if (!socket) return;

    if (socket.readyState !== 1 /* WebSocket.OPEN */) return;
    socket.send(JSON.stringify(event));
  }
}

