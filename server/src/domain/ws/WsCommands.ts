export type CreateRoomCommand = {
  type: "createRoom";
};

export type JoinRoomCommand = {
  type: "join";
  roomId: string;
};

export type RelayMessageCommand = {
  type: "message";
  roomId: string;
  message: string;
};

export type WsClientCommand = CreateRoomCommand | JoinRoomCommand | RelayMessageCommand;

