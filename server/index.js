const webSocket = require("ws");
const websocket = new webSocket.Server({ port: 8080 }, () =>
  console.log("server is running in port 8080")
);

websocket.on("connection", (ws) => {
  console.log("ws server connect vayo");

  ws.on("message", (msg) => {
    const message = msg.toString(); // Buffer ma aaudo raixa texxt
    console.log({ msg, message });
    console.log("Received message: ", message);

    ws.send("hello from server to client");
  });
});
