import { createContext, useContext, useEffect, useRef, useState } from "react";

type WebSocketContextType = {
  ws: React.MutableRefObject<WebSocket | null>;
  isReady: boolean;
};

const WebSocketContext = createContext<WebSocketContextType>({
  ws: { current: null },
  isReady: false,
});

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ws = useRef<WebSocket | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log("Page change vayepaxi k hunxa");
    if (ws.current?.readyState === WebSocket.OPEN) return;
    const socket = new WebSocket("ws://localhost:8080");
    ws.current = socket;

    socket.onopen = () => {
      console.log("Global WS connected:", socket.readyState);
      setIsReady(true);
    };

    socket.onclose = () => {
      console.log("Global WS disconnected");
      setIsReady(false);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ ws, isReady }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
