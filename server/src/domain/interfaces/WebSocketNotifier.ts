import type { WsServerEvent } from "../ws/WsEvents";

export interface WebSocketNotifier {
  notifyRoom(roomId: string, event: WsServerEvent): Promise<void>;
}

