"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const buildDependencies_1 = require("./ddd/buildDependencies");
const createHttpApp_1 = require("./presentation/http/createHttpApp");
const WsGateway_1 = require("./presentation/websocket/WsGateway");
const attachWsServer_1 = require("./presentation/websocket/attachWsServer");
const port = Number(process.env.PORT) || 8080;
const publicBaseUrl = process.env.PUBLIC_BASE_URL ?? `http://localhost:${port}`;
const { httpDeps, wsDeps } = (0, buildDependencies_1.buildDependencies)({ port, publicBaseUrl });
const app = (0, createHttpApp_1.createHttpApp)(httpDeps);
const server = http_1.default.createServer(app);
const gateway = new WsGateway_1.WsGateway(wsDeps);
(0, attachWsServer_1.attachWsServer)(server, gateway);
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
