import type { FileStorage } from "../../domain/interfaces/FileStorage";
import type { RoomMembershipRepository } from "../../domain/interfaces/RoomMembershipRepository";
import type { WebSocketNotifier } from "../../domain/interfaces/WebSocketNotifier";
import type { FileReadyEvent } from "../../domain/ws/WsEvents";

export type UploadFileInput = {
  roomId: string;
  file: {
    originalName: string;
    mimeType: string;
    size: number;
    storedFileName: string; // multer disk storage final filename
  };
};

export class UploadFileToRoomUseCase {
  constructor(
    private readonly fileStorage: FileStorage,
    private readonly roomRepository: RoomMembershipRepository,
    private readonly websocketNotifier: WebSocketNotifier,
  ) {}

  async execute(input: UploadFileInput): Promise<{ downloadUrl: string; fileName: string }> {
    if (!input.roomId) {
      throw new Error("roomId is required");
    }

    const members = await this.roomRepository.getMembers(input.roomId);
    if (members.length === 0) {
      // Current behavior still uploads even if no members exist; notify none.
      // We still return the stored file URL.
    }

    const storedFile = this.fileStorage.buildStoredFile({
      originalName: input.file.originalName,
      mimeType: input.file.mimeType,
      size: input.file.size,
      storedFileName: input.file.storedFileName,
    });

    const event: FileReadyEvent = {
      type: "file-ready",
      fileName: storedFile.fileName,
      fileType: storedFile.fileType,
      fileSize: storedFile.fileSize,
      downloadUrl: storedFile.downloadUrl,
    };

    if (members.length > 0) {
      await this.websocketNotifier.notifyRoom(input.roomId, event);
    }

    return { downloadUrl: storedFile.downloadUrl, fileName: storedFile.fileName };
  }
}

