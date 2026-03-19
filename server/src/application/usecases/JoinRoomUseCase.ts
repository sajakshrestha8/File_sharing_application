import type { RoomMembershipRepository } from "../../domain/interfaces/RoomMembershipRepository";

export type JoinRoomInput = {
  socketId: string;
  roomId: string;
};

export type JoinRoomOutput = {
  roomId: string;
  message: string;
};

export class JoinRoomUseCase {
  constructor(private readonly roomRepository: RoomMembershipRepository) {}

  async execute(input: JoinRoomInput): Promise<JoinRoomOutput> {
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

