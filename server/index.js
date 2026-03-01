const http = require("http");
const webSocket = require("websocket").server;
let connection = null;

const httpServer = http.createServer((req, res) => {
  console.log("server created ");
});

const webSockert = new webSocket({
  httpServer: httpServer,
});

webSockert.on("request", (request) => {
  connection = request.accept(null, request.origin);
  connection.on("onOpen", () => console.log("open"));

  console.log(request);
});
console.log({ webSockert });

httpServer.listen(8080, () =>
  console.log("My server is listining in port 8080")
);
