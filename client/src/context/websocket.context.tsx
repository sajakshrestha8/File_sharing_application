import { createContext, useContext, useEffect, useRef, useState } from "react";

export type FileMeta = {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  totalChunks: number;
  roomId: string;
};

type WebSocketContextType = {
  ws: React.MutableRefObject<WebSocket | null>;
  isReady: boolean;
  clientId: string | null | undefined;
  pendingFileMeta: FileMeta | null;
  setPendingFileMeta: (file: FileMeta) => void;
  pendingChunks: ArrayBuffer[];
  setPendingChuncks: React.Dispatch<React.SetStateAction<ArrayBuffer[]>>;
};
const WebSocketContext = createContext<WebSocketContextType>({
  ws: { current: null },
  isReady: false,
  clientId: null,
  pendingFileMeta: null,
  setPendingFileMeta: () => {},
  pendingChunks: [],
  setPendingChuncks: () => {},
});

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ws = useRef<WebSocket | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [clientId, setClientId] = useState<string | null>();
  const [pendingFileMeta, setPendingFileMeta] = useState<FileMeta | null>(null);
  const [pendingChunks, setPendingChuncks] = useState<ArrayBuffer[]>([]);

  useEffect(() => {
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

    const handleMessage = (event: MessageEvent) => {
      if (event.data instanceof Blob) {
        event.data.arrayBuffer().then((buffer) => {
          setPendingChuncks((prev) => [...prev, buffer]);
        });
        return;
      }

      try {
        const data = JSON.parse(event.data);

        if (data?.type === "identify" && data?.clientId) {
          setClientId(data.clientId);
          return;
        }

        if (data.type === "file-meta") {
          setPendingFileMeta(data);
        }
      } catch (error) {
        console.error("Failed", error);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        ws,
        isReady,
        clientId,
        pendingChunks,
        setPendingChuncks,
        pendingFileMeta,
        setPendingFileMeta,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
