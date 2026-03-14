import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { WebSocketProvider } from "./context/websocket.context.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <WebSocketProvider>
      {/* Commented to escape from ws disconnection issue*/}
      {/* <StrictMode> */}
      <App />
      {/* </StrictMode> */}
    </WebSocketProvider>
  </BrowserRouter>
);
