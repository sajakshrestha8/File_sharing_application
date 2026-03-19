"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDependencies = void 0;
const path_1 = __importDefault(require("path"));
const PrismaUserRepository_1 = require("../infrastructure/persistence/PrismaUserRepository");
const RedisRoomMembershipRepository_1 = require("../infrastructure/persistence/RedisRoomMembershipRepository");
const DiskFileStorage_1 = require("../infrastructure/storage/DiskFileStorage");
const SocketRegistryInMemory_1 = require("../infrastructure/realtime/SocketRegistryInMemory");
const WsNotifier_1 = require("../infrastructure/realtime/WsNotifier");
const RegisterUserUseCase_1 = require("../application/usecases/RegisterUserUseCase");
const LoginUserUseCase_1 = require("../application/usecases/LoginUserUseCase");
const CreateRoomUseCase_1 = require("../application/usecases/CreateRoomUseCase");
const JoinRoomUseCase_1 = require("../application/usecases/JoinRoomUseCase");
const RelayMessageUseCase_1 = require("../application/usecases/RelayMessageUseCase");
const UploadFileToRoomUseCase_1 = require("../application/usecases/UploadFileToRoomUseCase");
const buildDependencies = () => {
    // Existing JS infra adapters (Prisma + Redis) are CJS exports.
    // We intentionally keep this composition-root in TS so later steps can fully migrate runtime.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const prisma = require("../../connection/dbconnection");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const redisClient = require("../../redisClient/redisClient");
    const socketRegistry = new SocketRegistryInMemory_1.SocketRegistryInMemory();
    const roomRepository = new RedisRoomMembershipRepository_1.RedisRoomMembershipRepository(redisClient);
    const userRepository = new PrismaUserRepository_1.PrismaUserRepository(prisma);
    const uploadedFilesDir = path_1.default.resolve(__dirname, "../../uploadedFiles");
    const baseUrl = "http://localhost:8080";
    const diskFileStorage = new DiskFileStorage_1.DiskFileStorage(baseUrl, uploadedFilesDir);
    const websocketNotifier = new WsNotifier_1.WsNotifier(roomRepository, socketRegistry);
    const registerUseCase = new RegisterUserUseCase_1.RegisterUserUseCase(userRepository);
    const loginUseCase = new LoginUserUseCase_1.LoginUserUseCase(userRepository);
    const createRoomUseCase = new CreateRoomUseCase_1.CreateRoomUseCase(roomRepository);
    const joinRoomUseCase = new JoinRoomUseCase_1.JoinRoomUseCase(roomRepository);
    const relayMessageUseCase = new RelayMessageUseCase_1.RelayMessageUseCase(roomRepository, websocketNotifier);
    const uploadFileUseCase = new UploadFileToRoomUseCase_1.UploadFileToRoomUseCase(diskFileStorage, roomRepository, websocketNotifier);
    const httpDeps = {
        registerUseCase,
        loginUseCase,
        uploadFileUseCase,
        diskFileStorage,
        fileStorageForDownload: diskFileStorage,
        uploadedFilesDir,
        port: 8080,
    };
    const wsDeps = {
        socketRegistry,
        roomMembershipRepository: roomRepository,
        createRoomUseCase,
        joinRoomUseCase,
        relayMessageUseCase,
    };
    return { httpDeps, wsDeps };
};
exports.buildDependencies = buildDependencies;
