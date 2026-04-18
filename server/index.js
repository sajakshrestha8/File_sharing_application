const express = require("express");
const webSocket = require("ws");
const bcrypt = require("bcrypt");
const prisma = require("./connection/dbconnection");
const { randomUUID } = require("crypto");
const redisClient = require("./redisClient/redisClient");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const setupSwagger = require("./utils/swagger");
const { logger } = require("./utils/logger");

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());
setupSwagger(app, PORT);

const uploadDir = "./uploadedFiles";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const fileId = randomUUID();
    cb(null, `${fileId}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.use(
  "/uploadedFiles",
  (_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    next();
  },
  express.static(path.join(__dirname, "uploadedFiles"))
);

const sockets = {};

app.get("/", async (req, res) => {
  logger.info("Welcome to the root page");
  res.send("Hello From the server");
});

app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password)
      throw new Error("All fields are required");

    const hashedPassword = await bcrypt.hash(password, 10);
    const registeredUser = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword },
    });

    res.status(200).json({ success: true, registeredUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error("All fields are required");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User with this email is not registered");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Incorrect password");

    res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

const latestFiles = {};

app.post("/files/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");

    const { roomId } = req.body;
    if (!roomId) throw new Error("roomId is required");

    const filePayload = {
      type: "file-ready",
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      downloadUrl: `http://localhost:8080/uploadedFiles/${req.file.filename}`,
    };

    latestFiles[roomId] = filePayload;

    console.log(latestFiles, "-------=================-------------");

    const downloadUrl = `http://localhost:8080/uploadedFiles/${req.file.filename}`;
    console.log(`File uploaded: ${req.file.filename} for room: ${roomId}`);

    const users = await redisClient.sMembers(`room:${roomId}`);
    console.log(`Notifying ${users.length} users in room ${roomId}:`, users);

    users.forEach((userId) => {
      const socket = sockets[userId];
      if (socket?.readyState === webSocket.OPEN) {
        socket.send(JSON.stringify(filePayload));
      }
    });

    res.status(200).json({
      success: true,
      fileName: req.file.originalname,
      downloadUrl,
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get("/files/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploadedFiles", req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  res.download(filePath);
});

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

const wss = new webSocket.Server({ server });

wss.on("connection", (ws) => {
  ws.id = randomUUID();
  sockets[ws.id] = ws;
  console.log(`Connected: ${ws.id} | Total: ${Object.keys(sockets).length}`);

  ws.send(JSON.stringify({ type: "identify", clientId: ws.id }));

  ws.on("close", async () => {
    console.log(`Disconnected: ${ws.id}`);
    delete sockets[ws.id];

    try {
      const allRooms = await redisClient.sMembers("rooms");
      for (const roomId of allRooms) {
        await redisClient.sRem(`room:${roomId}`, ws.id);
      }
    } catch (error) {
      console.error("Redis cleanup error:", error);
    }
  });

  ws.on("message", async (msg, isBinary) => {
    console.log("Yesma trigger hunxa ki nai");
    if (isBinary) {
      console.warn("Binary message received - ignored (use HTTP upload)");
      return;
    }

    let message;
    try {
      message = JSON.parse(msg);
    } catch (e) {
      console.error("Failed to parse message:", e);
      return;
    }

    console.log(`[${message.type}] from ${ws.id}`);

    if (message.type === "createRoom") {
      const createdRoomId = randomUUID();
      await redisClient.sAdd("rooms", createdRoomId);
      await redisClient.sAdd(`room:${createdRoomId}`, ws.id);
      sockets[ws.id] = ws;

      console.log(`Room created: ${createdRoomId} by ${ws.id}`);
      console.log(
        `Room members:`,
        await redisClient.sMembers(`room:${createdRoomId}`)
      );

      ws.send(
        JSON.stringify({
          type: "room-created",
          message: "Room created successfully",
          roomId: createdRoomId,
        })
      );
      return;
    }

    if (message.type === "join") {
      if (!message.roomId) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "roomId is required",
          })
        );
        return;
      }

      await redisClient.sAdd(`room:${message.roomId}`, ws.id);
      sockets[ws.id] = ws;

      const members = await redisClient.sMembers(`room:${message.roomId}`);
      console.log(`${ws.id} joined room ${message.roomId}`);
      console.log("Room members:", members);

      ws.send(
        JSON.stringify({
          type: "join-ack",
          roomId: message.roomId,
          message: "Joined room successfully",
        })
      );

      const latestFile = latestFiles[message.roomId];

      if (latestFile) {
        console.log(`Sending latest file to ${ws.id}`);
        ws.send(JSON.stringify(latestFile));
      }

      return;
    }

    if (message.type === "message") {
      if (!message.roomId) {
        ws.send(
          JSON.stringify({ type: "error", message: "roomId is required" })
        );
        return;
      }

      const users = await redisClient.sMembers(`room:${message.roomId}`);
      console.log(
        `Relaying message to ${users.length} users in room ${message.roomId}`
      );

      users.forEach((userId) => {
        const socket = sockets[userId];
        if (socket && socket.readyState === webSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "message",
              message: message.message,
              from: ws.id,
            })
          );
        }
      });
      return;
    }

    console.warn(`Unknown message type: ${message.type}`);
  });
});
