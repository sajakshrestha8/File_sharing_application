"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiskFileStorage = void 0;
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const crypto_1 = require("crypto");
class DiskFileStorage {
    constructor(baseUrl, uploadedFilesDir) {
        this.baseUrl = baseUrl;
        this.uploadedFilesDir = uploadedFilesDir;
    }
    buildStoredFile(input) {
        const downloadUrl = `${this.baseUrl}/uploadedFiles/${encodeURIComponent(input.storedFileName)}`;
        return {
            fileName: input.originalName,
            fileType: input.mimeType,
            fileSize: input.size,
            downloadUrl,
        };
    }
    ensureUploadedDirExists() {
        const fs = require("fs");
        if (!fs.existsSync(this.uploadedFilesDir))
            fs.mkdirSync(this.uploadedFilesDir);
    }
    resolveStoredPath(storedFileName) {
        return path_1.default.join(this.uploadedFilesDir, storedFileName);
    }
    createMulterDiskStorage() {
        this.ensureUploadedDirExists();
        return multer_1.default.diskStorage({
            destination: (_req, _file, cb) => {
                cb(null, this.uploadedFilesDir);
            },
            filename: (_req, file, cb) => {
                const fileId = (0, crypto_1.randomUUID)();
                cb(null, `${fileId}-${file.originalname}`);
            },
        });
    }
}
exports.DiskFileStorage = DiskFileStorage;
