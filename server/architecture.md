# DDD Production Architecture (File Sharing)

## Goals
- Refactor the backend into a Domain-Driven Design (DDD) structure suitable for production maintenance.
- Keep the **external API contract stable** so the existing frontend keeps working:
  - HTTP endpoints and response shapes.
  - WebSocket message types and payload shapes.

## Bounded Contexts

### `User` (Authentication)
- Responsibility: register/login users.
- Persistence: PostgreSQL via Prisma (`server/prisma/schema.prisma`).

### `Room` (Ephemeral room membership + registry)
- Responsibility: keep track of which sockets are currently connected to which rooms.
- Persistence: Redis sets
  - Global room registry: `rooms`
  - Room members: `room:{roomId}`

### `FileSharing` (Upload + room notification)
- Responsibility: store uploaded files and notify all room members when a file is ready.
- Storage: local disk under `server/uploadedFiles` (via Multer).

### `Chat` (Relay-only messaging)
- Responsibility: relay chat messages to all connected sockets in the same room.
- Persistence: none (relay through WebSocket).

## External Contract (Stable)

### HTTP
- `POST /register`
  - Request: `{ firstName, lastName, email, password }`
  - Behavior: hashes password with bcrypt and persists user.
  - Response: `{ success: true, registeredUser }` or `{ success: false, error }`

- `POST /login`
  - Request: `{ email, password }`
  - Behavior: validates user credentials (bcrypt compare).
  - Response: `{ success: true, message }` or `{ success: false, error }`

- `POST /files/upload`
  - Multipart form-data:
    - `file` (max 50MB)
    - `roomId` (string)
  - Response: `{ success: true, fileName, downloadUrl }` or `{ success: false, error }`

- `GET /files/:filename`
  - Downloads file from disk.

### WebSocket
Client -> Server message types (JSON):
- `createRoom`
- `join` `{ type: "join", roomId }`
- `message` `{ type: "message", roomId, message }`

Server -> Client event types (JSON):
- `createRoom` ack: `{ type: "room-created", roomId, message: "Room created successfully" }`
- `join` ack: `{ type: "join-ack", roomId, message: "Joined room successfully" }`
- `message` relay: `{ type: "message", message: <string>, from: <socketId> }`
- `file-ready` notify:
  `{ type: "file-ready", fileName, fileType, fileSize, downloadUrl }`

## Layering (DDD)

### Domain Layer (`src/domain/*`)
- Entities and value objects (where appropriate).
- Interfaces (repository/gateway contracts).
- Domain message/DTO shapes for WebSocket (as “what” the domain needs).
- No Express/WS/Prisma/Redis specifics here.

### Application Layer (`src/application/*`)
- Use cases that orchestrate the work:
  - `RegisterUserUseCase`
  - `LoginUserUseCase`
  - `CreateRoomUseCase`
  - `JoinRoomUseCase`
  - `RelayMessageUseCase`
  - `UploadFileToRoomUseCase`
- Depends on domain interfaces only.

### Infrastructure Layer (`src/infrastructure/*`)
- Prisma-based repository implementations.
- Redis-based room membership repository.
- Disk-based file storage implementation.
- WebSocket sending adapter + socket registry.

### Presentation Layer (`src/presentation/*`)
- Express HTTP controllers: parse request, call use case, return response.
- WebSocket gateway: parse messages, call use cases, send events.

## Architecture Flow (HTTP + WebSocket)

```mermaid
flowchart TD
  UI[Client UI]

  subgraph HTTP[HTTP Requests]
    HTTPController[HTTP Controller]
    UploadController[Upload HTTP Controller]
  end

  subgraph WS[WebSocket]
    WsGateway[WebSocket Gateway]
  end

  subgraph App[Application Use Cases]
    UCAuth[Register/Login Use Cases]
    UCUpload[UploadFileToRoomUseCase]
    UCRoom[CreateRoom/JoinRoom Use Cases]
    UCChat[RelayMessageUseCase]
  end

  subgraph Domain[Domain Interfaces]
    AuthRepo[UserRepository (interface)]
    RoomRepo[RoomMembershipRepository (interface)]
    FileStore[FileStorage (interface)]
    WsNotifier[WebSocketNotifier (interface)]
  end

  subgraph Infra[Infrastructure Implementations]
    PrismaRepo[Prisma UserRepository]
    RedisRepo[Redis RoomMembershipRepository]
    DiskStore[Disk FileStorage]
    WsSend[SocketRegistry + WebSocket Notifier]
  end

  UI -->|POST /register, POST /login| HTTPController
  UI -->|POST /files/upload| UploadController
  UI -->|WS createRoom/join/message| WsGateway

  HTTPController --> UCAuth
  UploadController --> UCUpload
  WsGateway --> UCRoom
  WsGateway --> UCChat

  UCAuth --> AuthRepo --> PrismaRepo
  UCUpload --> FileStore --> DiskStore
  UCUpload --> RoomRepo --> RedisRepo
  UCUpload --> WsNotifier --> WsSend

  UCRoom --> RoomRepo --> RedisRepo
  UCChat --> RoomRepo --> RedisRepo
  UCChat --> WsNotifier --> WsSend
```

## Production Readiness Notes
- Keep adapter boundaries explicit (presentation -> application -> domain -> infrastructure).
- Keep message/event payloads centralized (single source of truth for WebSocket “types”).
- Ensure infrastructure dependencies (Prisma/Redis/fs/ws) are injected into use cases via interfaces.

## Runtime & entrypoint

- **DDD entry**: `server/src/main.ts` wires `buildDependencies` → `createHttpApp` → HTTP server + `WsGateway` (WebSocket).
- **Development**: `npm run dev` (or `npm run dev:ts`) runs `ts-node src/main.ts` with reload on `src/` changes.
- **Production**: `npm start` runs `prestart` (`npm run build`) then `node dist/main.js`.
- **Compatibility**: `server/index.js` loads `./dist/main.js` so `node index.js` works after a build.
- **Legacy monolith** (reference only): `npm run start:legacy` runs `index.legacy.js`.
- **Environment**:
  - `PORT` — HTTP + WebSocket listen port (default `8080`).
  - `PUBLIC_BASE_URL` — base URL used in file download links from uploads (default `http://localhost:<PORT>`).

