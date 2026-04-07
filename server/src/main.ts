import http from "http";

import { buildDependencies } from "./ddd/buildDependencies";
import { createHttpApp } from "./presentation/http/createHttpApp";
import { WsGateway } from "./presentation/websocket/WsGateway";
import { attachWsServer } from "./presentation/websocket/attachWsServer";

const port = Number(process.env.PORT) || 8080;
const publicBaseUrl =
  process.env.PUBLIC_BASE_URL ?? `http://localhost:${port}`;

const { httpDeps, wsDeps } = buildDependencies({ port, publicBaseUrl });
const app = createHttpApp(httpDeps);
const server = http.createServer(app);
const gateway = new WsGateway(wsDeps);
attachWsServer(server, gateway);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
