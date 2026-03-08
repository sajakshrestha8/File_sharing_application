const express = require("express");
const webSocket = require("ws");
const bcrypt = require("bcrypt");
const prisma = require("./connection/dbconnection");
const { randomUUID } = require("crypto");

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
console.log(rooms);

const server = app.listen(PORT, () =>
  console.log("server is running in port 8080")
);

const websocket = new webSocket.Server({ server });

// room create gareko hai
websocket.on("connection", (ws) => {
  ws.on("message", (msg) => {
    const message = JSON.parse(msg);

    if (message.type === "createRoom") {
      const createdRoomId = randomUUID();

      ws.send(
        JSON.stringify({
          message: "Room created succcessfully",
          roomId: createdRoomId,
        })
      );
    }

    console.log(message);

    if (message.type === "join") {
      const { roomId } = message;

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }

      rooms.get(roomId).add(ws);

      ws.roomId = roomId;

      console.log(roomId, "Room Id");

      ws.send(JSON.stringify({ message: `Joined room ${roomId}` }));
    }

    ws.send(JSON.stringify({ message: "hello from server to client" }));
  });
});
