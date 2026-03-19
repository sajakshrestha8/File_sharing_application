export interface SocketRegistry {
  register(socketId: string, ws: unknown): void;
  get(socketId: string): unknown | undefined;
  remove(socketId: string): void;
}

