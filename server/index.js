const express = require("express");
const webSocket = require("ws");
const bcrypt = require("bcrypt");
const prisma = require("./connection/dbconnection");
const { randomUUID } = require("crypto");
const redisClient = require("./redisClient/redisClient");

console.log(redisClient, "Yo po ho class");

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

// web socket connection

const rooms = new Map();
const sockets = {};

console.log({ sockets });

const server = app.listen(PORT, () =>
  console.log("server is running in port 8080")
);

const websocket = new webSocket.Server({ server });

// room create gareko hai
websocket.on("connection", (ws) => {
  console.log("websocket connectio ta vairako nai xa ta hajur");
  ws.id = randomUUID();

  ws.on("message", async (msg) => {
    const message = JSON.parse(msg);

    if (message.type === "createRoom") {
      const createdRoomId = randomUUID();
      console.log({ createdRoomId });

      await redisClient.sAdd("rooms", createdRoomId);

      ws.send(
        JSON.stringify({
          message: "Room created succcessfully",
          roomId: createdRoomId,
        })
      );
    }

    if (message.type === "join") {
      await redisClient.sAdd(`room:${message.roomId}`, ws.id);

      sockets[ws.id] = ws;
    }

    if (message.type === "message") {
      const users = await redisClient.sMembers(`room:${message.roomId}`);
      console.log({ users });

      users.forEach((userId) => {
        const socket = sockets[userId];
        console.log({ socket });
        console.log(message);
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
  });
});
