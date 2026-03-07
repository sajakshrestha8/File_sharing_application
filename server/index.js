const express = require("express");
const webSocket = require("ws");
const bcrypt = require("bcrypt");
const prisma = require("./connection/dbconnection");

const app = express();
const PORT = 8080;

app.use(express.json());

app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password)
      throw new Error(`All fields are required`);

    const hashedPassword = await bcrypt.hash(password, 10);
    const registeredUser = await prisma.User.create({
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

    const user = await prisma.User.findUnique({
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

const server = app.listen(PORT, () =>
  console.log("server is running in port 8080")
);

const websocket = new webSocket.Server({ server });

// room create gareko hai
websocket.on("connection", (ws) => {
  console.log(ws);
  console.log("ws server connect vayo");

  ws.on("message", (msg) => {
    const message = msg.toString(); // Buffer ma aaudo raixa text
    console.log({ msg, message });
    console.log("Received message: ", message);

    ws.send("hello from server to client");
  });
});
