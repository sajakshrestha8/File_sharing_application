import type { WebSocketNotifier } from "../../domain/interfaces/WebSocketNotifier";
import type { RoomMembershipRepository } from "../../domain/interfaces/RoomMembershipRepository";
import type { SocketRegistry } from "../../domain/interfaces/SocketRegistry";
import type { WsServerEvent } from "../../domain/ws/WsEvents";

export class WsNotifier implements WebSocketNotifier {
  constructor(
    private readonly roomMembershipRepository: RoomMembershipRepository,
    private readonly socketRegistry: SocketRegistry,
  ) {}

  async notifyRoom(roomId: string, event: WsServerEvent): Promise<void> {
    const members = await this.roomMembershipRepository.getMembers(roomId);

    for (const socketId of members) {
      const socket = this.socketRegistry.get(socketId);
      if (!socket) continue;

      // `ws` instances have `send` and `readyState`. We keep the type as `unknown`
      // in the domain layer to avoid leaking infrastructure details.
      const ws = socket as unknown as { readyState: number; send: (data: string) => void };
      if (ws.readyState !== 1 /* WebSocket.OPEN */) continue;

      ws.send(JSON.stringify(event));
    }
  }
}

