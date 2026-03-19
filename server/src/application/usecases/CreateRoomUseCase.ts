import { randomUUID } from "crypto";
import type { RoomMembershipRepository } from "../../domain/interfaces/RoomMembershipRepository";

export type CreateRoomInput = {
  socketId: string;
};

export type CreateRoomOutput = {
  roomId: string;
  message: string;
};

export class CreateRoomUseCase {
  constructor(private readonly roomRepository: RoomMembershipRepository) {}

  async execute(input: CreateRoomInput): Promise<CreateRoomOutput> {
    const createdRoomId = randomUUID();

    await this.roomRepository.addRoom(createdRoomId);
    await this.roomRepository.addMember(createdRoomId, input.socketId);

    return {
      roomId: createdRoomId,
      message: "Room created successfully",
    };
  }
}

