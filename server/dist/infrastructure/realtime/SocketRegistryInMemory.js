"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketRegistryInMemory = void 0;
class SocketRegistryInMemory {
    constructor() {
        this.sockets = new Map();
    }
    register(socketId, ws) {
        this.sockets.set(socketId, ws);
    }
    get(socketId) {
        return this.sockets.get(socketId);
    }
    remove(socketId) {
        this.sockets.delete(socketId);
    }
    size() {
        return this.sockets.size;
    }
}
exports.SocketRegistryInMemory = SocketRegistryInMemory;
