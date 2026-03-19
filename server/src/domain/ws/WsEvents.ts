export type RoomCreatedEvent = {
  type: "room-created";
  roomId: string;
  message: string;
};

export type JoinAckEvent = {
  type: "join-ack";
  roomId: string;
  message: string;
};

export type ChatMessageRelayedEvent = {
  type: "message";
  message: string;
  from: string;
};

export type FileReadyEvent = {
  type: "file-ready";
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
};

export type ErrorEvent = {
  type: "error";
  message: string;
};

export type WsServerEvent =
  | RoomCreatedEvent
  | JoinAckEvent
  | ChatMessageRelayedEvent
  | FileReadyEvent
  | ErrorEvent;

