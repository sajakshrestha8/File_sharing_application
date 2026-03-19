"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const RegisterController_1 = require("./controllers/RegisterController");
const LoginController_1 = require("./controllers/LoginController");
const FileUploadController_1 = require("./controllers/FileUploadController");
const FileDownloadController_1 = require("./controllers/FileDownloadController");
const createHttpApp = (deps) => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cors_1.default)());
    if (!fs_1.default.existsSync(deps.uploadedFilesDir))
        fs_1.default.mkdirSync(deps.uploadedFilesDir);
    // Serve uploaded files.
    app.use("/uploadedFiles", express_1.default.static(path_1.default.resolve(deps.uploadedFilesDir)));
    // Configure multer to use the same naming strategy as the existing server.
    const storage = deps.diskFileStorage.createMulterDiskStorage();
    const upload = (0, multer_1.default)({
        storage,
        limits: { fileSize: 50 * 1024 * 1024 },
    });
    app.post("/register", (0, RegisterController_1.registerController)(deps.registerUseCase));
    app.post("/login", (0, LoginController_1.loginController)(deps.loginUseCase));
    app.post("/files/upload", upload.single("file"), (0, FileUploadController_1.fileUploadController)(deps.uploadFileUseCase));
    app.get("/files/:filename", (0, FileDownloadController_1.fileDownloadController)(deps.fileStorageForDownload));
    return app;
};
exports.createHttpApp = createHttpApp;
