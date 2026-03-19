"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachWsServer = void 0;
const ws_1 = require("ws");
const attachWsServer = (httpServer, gateway) => {
    const wss = new ws_1.WebSocketServer({ server: httpServer });
    wss.on("connection", (ws) => gateway.handleConnection(ws));
    return wss;
};
exports.attachWsServer = attachWsServer;
