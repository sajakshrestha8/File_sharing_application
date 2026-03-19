import type { Request, Response } from "express";
import type { FileStorage } from "../../../domain/interfaces/FileStorage";

type FileStorageWithDownload = FileStorage;

export const fileDownloadController =
  (fileStorage: FileStorageWithDownload) =>
  async (req: Request, res: Response) => {
    const storedFileName = req.params.filename as string;
    try {
      const filePath = fileStorage.resolveStoredPath(storedFileName);
      const fs = require("fs") as typeof import("fs");
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      return res.download(filePath);
    } catch (error) {
      res.status(404).json({ error: "File not found" });
    }
  };

