import type { StoredFile, FileStorage } from "../../domain/interfaces/FileStorage";
import path from "path";
import multer from "multer";
import { randomUUID } from "crypto";

export class DiskFileStorage implements FileStorage {
  constructor(private readonly baseUrl: string, private readonly uploadedFilesDir: string) {}

  buildStoredFile(input: {
    originalName: string;
    mimeType: string;
    size: number;
    storedFileName: string;
  }): StoredFile {
    // Keep the URL shape compatible with the existing production server.
    // The current JS server uses `req.file.filename` directly.
    const downloadUrl = `${this.baseUrl}/uploadedFiles/${input.storedFileName}`;

    return {
      fileName: input.originalName,
      fileType: input.mimeType,
      fileSize: input.size,
      downloadUrl,
    };
  }

  ensureUploadedDirExists(): void {
    const fs = require("fs") as typeof import("fs");
    if (!fs.existsSync(this.uploadedFilesDir)) fs.mkdirSync(this.uploadedFilesDir);
  }

  resolveStoredPath(storedFileName: string): string {
    return path.join(this.uploadedFilesDir, storedFileName);
  }

  createMulterDiskStorage(): multer.StorageEngine {
    this.ensureUploadedDirExists();

    return multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, this.uploadedFilesDir);
      },
      filename: (_req, file, cb) => {
        const fileId = randomUUID();
        cb(null, `${fileId}-${file.originalname}`);
      },
    });
  }
}

