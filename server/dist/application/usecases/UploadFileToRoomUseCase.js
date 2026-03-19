"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFileToRoomUseCase = void 0;
class UploadFileToRoomUseCase {
    constructor(fileStorage, roomRepository, websocketNotifier) {
        this.fileStorage = fileStorage;
        this.roomRepository = roomRepository;
        this.websocketNotifier = websocketNotifier;
    }
    async execute(input) {
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
        const event = {
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
exports.UploadFileToRoomUseCase = UploadFileToRoomUseCase;
