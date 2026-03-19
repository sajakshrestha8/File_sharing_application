import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";

import type { RegisterUserUseCase } from "../../application/usecases/RegisterUserUseCase";
import type { LoginUserUseCase } from "../../application/usecases/LoginUserUseCase";
import type { UploadFileToRoomUseCase } from "../../application/usecases/UploadFileToRoomUseCase";
import type { DiskFileStorage } from "../../infrastructure/storage/DiskFileStorage";
import type { FileStorage } from "../../domain/interfaces/FileStorage";

import { registerController } from "./controllers/RegisterController";
import { loginController } from "./controllers/LoginController";
import { fileUploadController } from "./controllers/FileUploadController";
import { fileDownloadController } from "./controllers/FileDownloadController";

export type HttpAppDeps = {
  registerUseCase: RegisterUserUseCase;
  loginUseCase: LoginUserUseCase;
  uploadFileUseCase: UploadFileToRoomUseCase;
  diskFileStorage: DiskFileStorage;
  fileStorageForDownload: FileStorage;
  uploadedFilesDir: string;
  port: number;
};

export const createHttpApp = (deps: HttpAppDeps) => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  if (!fs.existsSync(deps.uploadedFilesDir)) fs.mkdirSync(deps.uploadedFilesDir);

  // Serve uploaded files.
  app.use(
    "/uploadedFiles",
    express.static(path.resolve(deps.uploadedFilesDir)),
  );

  // Configure multer to use the same naming strategy as the existing server.
  const storage = deps.diskFileStorage.createMulterDiskStorage();
  const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
  });

  app.post("/register", registerController(deps.registerUseCase));
  app.post("/login", loginController(deps.loginUseCase));
  app.post(
    "/files/upload",
    upload.single("file"),
    fileUploadController(deps.uploadFileUseCase),
  );
  app.get("/files/:filename", fileDownloadController(deps.fileStorageForDownload));

  return app;
};

