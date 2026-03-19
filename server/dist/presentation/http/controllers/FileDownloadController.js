"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileDownloadController = void 0;
const fileDownloadController = (fileStorage) => async (req, res) => {
    const storedFileName = req.params.filename;
    try {
        const filePath = fileStorage.resolveStoredPath(storedFileName);
        const fs = require("fs");
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "File not found" });
        }
        return res.download(filePath);
    }
    catch (error) {
        res.status(404).json({ error: "File not found" });
    }
};
exports.fileDownloadController = fileDownloadController;
