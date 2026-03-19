import { WebSocketServer } from "ws";
import type { WsGateway } from "./WsGateway";

export const attachWsServer = (httpServer: any, gateway: WsGateway) => {
  const wss = new WebSocketServer({ server: httpServer });
  wss.on("connection", (ws) => gateway.handleConnection(ws));
  return wss;
};

