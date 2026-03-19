export interface RoomMembershipRepository {
  addRoom(roomId: string): Promise<void>;
  addMember(roomId: string, socketId: string): Promise<void>;
  removeMember(roomId: string, socketId: string): Promise<void>;

  getMembers(roomId: string): Promise<string[]>;
  getAllRooms(): Promise<string[]>;
}

