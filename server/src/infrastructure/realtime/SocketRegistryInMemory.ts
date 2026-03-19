import type { SocketRegistry } from "../../domain/interfaces/SocketRegistry";

export class SocketRegistryInMemory implements SocketRegistry {
  private readonly sockets = new Map<string, unknown>();

  register(socketId: string, ws: unknown): void {
    this.sockets.set(socketId, ws);
  }

  get(socketId: string): unknown | undefined {
    return this.sockets.get(socketId);
  }

  remove(socketId: string): void {
    this.sockets.delete(socketId);
  }
}

