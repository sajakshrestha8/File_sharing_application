const express = require("express");
const webSocket = require("ws");
const bcrypt = require("bcrypt");
const prisma = require("./connection/dbconnection");
const { randomUUID } = require("crypto");
const redisClient = require("./redisClient/redisClient");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = 8080;

app.use(express.json());

app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password)
      throw new Error(`All fields are required`);

    const hashedPassword = await bcrypt.hash(password, 10);
    const registeredUser = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword },
    });
    res.status(200).json({ success: true, registeredUser });
  } catch (error) {
    res.status(400).json({
      success: "false",
      error: error.message,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw new Error("All fields are required");

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new Error("User with the email is not registered");

    const decryptedPassword = await bcrypt.compare(password, user.password);

    if (!decryptedPassword) throw new Error("Incorrect password");

    res.status(200).json({ success: "true", message: "login successfull" });
  } catch (error) {
    res.status(400).json({
      success: "false",
      error: error.message,
    });
  }
});

app.get("/files/:id", (req, res) => {
  const fileId = req.params.id;

  const filePath = getFilePathFromDB(fileId);

  res.download(filePath);
});

// web socket connection

const sockets = {};
const fileStreams = {};

const server = app.listen(PORT, () =>
  console.log("server is running in port 8080")
);

const websocket = new webSocket.Server({ server });

// room create gareko hai
websocket.on("connection", (ws) => {
  ws.id = randomUUID();
  sockets[ws.id] = ws;

  ws.on("close", async () => {
    delete sockets[ws.id];
    const allRooms = await redisClient.sMembers("rooms");
    for (const roomId of allRooms) {
      await redisClient.sRem(`room:${roomId}`, ws.id);
    }
  });

  ws.on("message", async (msg, isBinary) => {
    let message;
    console.log({ isBinary });

    if (!isBinary) {
      message = JSON.parse(msg);

      if (message.type === "file-meta") {
        const filePath = `./uploadedFiles/${message.fileId}-${message.fileName}`;

        ws.fileId = message.fileId;
        ws.roomId = message.roomId;
        ws.totalChunks = message.totalChunks;
        ws.receivedChunks = 0;

        fileStreams[message.fileId] = fs.createWriteStream(filePath);

        const users = await redisClient.sMembers(`room:${message.roomId}`);

        users.forEach((userId) => {
          const socket = sockets[userId];
          if (socket && socket.readyState === 1) {
            socket.send(
              JSON.stringify({
                type: "file-meta",
                fileId: message.fileId,
                fileName: message.fileName,
                fileSize: message.fileSize,
                fileType: message.fileType,
                totalChunks: message.totalChunks,
                roomId: message.roomId,
              })
            );
          }
        });
        return;
      }
    }

    if (isBinary) {
      if (!ws.fileId || !fileStreams[ws.fileId]) {
        console.warn(
          "Binary received but no active fileStream for:",
          ws.fileId
        );
        return;
      }

      fileStreams[ws.fileId].write(msg);
      ws.receivedChunks = (ws.receivedChunks || 0) + 1;
      console.log(`Chunk ${ws.receivedChunks}/${ws.totalChunks}`);

      const users = await redisClient.sMembers(`room:${ws.roomId}`);
      users.forEach((userId) => {
        const socket = sockets[userId];
        if (socket && socket.readyState === 1 && userId !== ws.id) {
          socket.send(msg);
        }
      });
      return;
    }

    if (!message) return;

    if (message.type === "createRoom") {
      // 1
      const createdRoomId = randomUUID();

      await redisClient.sAdd("rooms", createdRoomId);
      await redisClient.sAdd(`room:${createdRoomId}`, ws.id);

      ws.send(
        JSON.stringify({
          type: "room-created",
          message: "Room created successfully",
          roomId: createdRoomId,
        })
      );
    }

    if (message.type === "join") {
      console.log(
        message,
        "Server ma message k aako nai tha vayena ni ta pasa"
      );
      if (!message.roomId) {
        ws.send(
          JSON.stringify({ type: "error", message: "roomId is required" })
        );
        return;
      }

      await redisClient.sAdd(`room:${message.roomId}`, ws.id);
      sockets[ws.id] = ws;

      console.log(`${ws.id} joined room: ${message.roomId}`);
      console.log(
        `Room members:`,
        await redisClient.sMembers(`room:${message.roomId}`)
      );

      ws.send(
        JSON.stringify({
          type: "join-ack",
          roomId: message.roomId,
          message: "Joined room successfully",
        })
      );
    }

    if (message.type === "message") {
      const users = await redisClient.sMembers(`room:${message.roomId}`);

      users.forEach((userId) => {
        const socket = sockets[userId];

        if (socket && socket.readyState === 1) {
          socket.send(
            JSON.stringify({
              type: "message",
              message: message.message,
              from: ws.id,
            })
          );
        }
      });
    }

    if (message.type === "file-complete") {
      if (!message.roomId || !message.fileId) return;

      const stream = fileStreams[message.fileId];
      if (stream) {
        stream.end(async () => {
          ws.send(
            JSON.stringify({
              type: "file-complete-ack",
              roomId: message.roomId,
              fileId: message.fileId,
            })
          );

          const users = await redisClient.sMembers(`room:${message.roomId}`);

          users?.forEach((userId) => {
            const socket = sockets[userId];

            if (socket && socket.readyState === 1) {
              socket.send(
                JSON.stringify({
                  type: "file-ready",
                  fileId: message.fileId,
                  fileName: message.fileName,
                  fileType: message.fileType,
                  downloadUrl: `http://localhost:8080/files/${message.fileId}-${message.fileName}`,
                })
              );
            }
          });
        });

        delete fileStreams[message.fileId];
      }
      return;
    }
  });
});
