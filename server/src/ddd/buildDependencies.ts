import path from "path";

import { PrismaUserRepository } from "../infrastructure/persistence/PrismaUserRepository";
import { RedisRoomMembershipRepository } from "../infrastructure/persistence/RedisRoomMembershipRepository";
import { DiskFileStorage } from "../infrastructure/storage/DiskFileStorage";
import { SocketRegistryInMemory } from "../infrastructure/realtime/SocketRegistryInMemory";
import { WsNotifier } from "../infrastructure/realtime/WsNotifier";

import { RegisterUserUseCase } from "../application/usecases/RegisterUserUseCase";
import { LoginUserUseCase } from "../application/usecases/LoginUserUseCase";
import { CreateRoomUseCase } from "../application/usecases/CreateRoomUseCase";
import { JoinRoomUseCase } from "../application/usecases/JoinRoomUseCase";
import { RelayMessageUseCase } from "../application/usecases/RelayMessageUseCase";
import { UploadFileToRoomUseCase } from "../application/usecases/UploadFileToRoomUseCase";

import type { HttpAppDeps } from "../presentation/http/createHttpApp";
import type { WsGatewayDeps } from "../presentation/websocket/WsGateway";

export type DddAppWiring = {
  httpDeps: HttpAppDeps;
  wsDeps: WsGatewayDeps;
};

export const buildDependencies = (): DddAppWiring => {
  // Existing JS infra adapters (Prisma + Redis) are CJS exports.
  // We intentionally keep this composition-root in TS so later steps can fully migrate runtime.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const prisma = require("../../connection/dbconnection");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const redisClient = require("../../redisClient/redisClient");

  const socketRegistry = new SocketRegistryInMemory();
  const roomRepository = new RedisRoomMembershipRepository(redisClient);
  const userRepository = new PrismaUserRepository(prisma);

  const uploadedFilesDir = path.resolve(__dirname, "../../uploadedFiles");
  const baseUrl = "http://localhost:8080";
  const diskFileStorage = new DiskFileStorage(baseUrl, uploadedFilesDir);
  const websocketNotifier = new WsNotifier(roomRepository, socketRegistry);

  const registerUseCase = new RegisterUserUseCase(userRepository);
  const loginUseCase = new LoginUserUseCase(userRepository);
  const createRoomUseCase = new CreateRoomUseCase(roomRepository);
  const joinRoomUseCase = new JoinRoomUseCase(roomRepository);
  const relayMessageUseCase = new RelayMessageUseCase(roomRepository, websocketNotifier);
  const uploadFileUseCase = new UploadFileToRoomUseCase(
    diskFileStorage,
    roomRepository,
    websocketNotifier,
  );

  const httpDeps: HttpAppDeps = {
    registerUseCase,
    loginUseCase,
    uploadFileUseCase,
    diskFileStorage,
    fileStorageForDownload: diskFileStorage,
    uploadedFilesDir,
    port: 8080,
  };

  const wsDeps: WsGatewayDeps = {
    socketRegistry,
    roomMembershipRepository: roomRepository,
    createRoomUseCase,
    joinRoomUseCase,
    relayMessageUseCase,
  };

  return { httpDeps, wsDeps };
};

