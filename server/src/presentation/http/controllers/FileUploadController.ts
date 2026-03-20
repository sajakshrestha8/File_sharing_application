import type { Request, Response } from "express";
import type { UploadFileToRoomUseCase } from "../../../application/usecases/UploadFileToRoomUseCase";

type MulterFile = {
  originalname: string;
  mimetype: string;
  size: number;
  filename: string;
};

export const fileUploadController =
  (useCase: UploadFileToRoomUseCase) =>
  async (req: Request, res: Response) => {
    try {
      const roomId = req.body?.roomId as string | undefined;
      const file = req.file as MulterFile | undefined;

      if (!file) throw new Error("No file uploaded");
      if (!roomId) throw new Error("roomId is required");

      const result = await useCase.execute({
        roomId,
        file: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          storedFileName: file.filename,
        },
      });

      console.log(`File uploaded: ${file.filename} for room: ${roomId}`);

      res.status(200).json({
        success: true,
        fileName: file.originalname,
        downloadUrl: result.downloadUrl,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Upload error:", message);
      res.status(400).json({ success: false, error: message });
    }
  };

