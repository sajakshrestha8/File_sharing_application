import type { RoomMembershipRepository } from "../../domain/interfaces/RoomMembershipRepository";
import type { WebSocketNotifier } from "../../domain/interfaces/WebSocketNotifier";
import type { ChatMessageRelayedEvent } from "../../domain/ws/WsEvents";

export type RelayMessageInput = {
  socketId: string;
  roomId: string;
  message: string;
};

export class RelayMessageUseCase {
  constructor(
    private readonly roomRepository: RoomMembershipRepository,
    private readonly websocketNotifier: WebSocketNotifier,
  ) {}

  async execute(input: RelayMessageInput): Promise<void> {
    if (!input.roomId) {
      throw new Error("roomId is required");
    }

    // Keep `roomRepository` dependency here to preserve the same semantics
    // as the current implementation (only relay if members exist).
    const members = await this.roomRepository.getMembers(input.roomId);
    if (members.length === 0) return;

    const event: ChatMessageRelayedEvent = {
      type: "message",
      message: input.message,
      from: input.socketId,
    };

    await this.websocketNotifier.notifyRoom(input.roomId, event);
  }
}

