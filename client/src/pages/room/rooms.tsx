import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./room.css";
import { useWebSocket } from "../../context/websocket.context";

interface ChatMessage {
  id: string;
  message: string;
  fileLink?: string;
  from?: string;
}

function Room() {
  const { slug } = useParams();
  const {
    ws,
    isReady,
    pendingChunks,
    setPendingChuncks,
    pendingFileMeta,
    setPendingFileMeta,
  } = useWebSocket();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [incomingFileMeta, setIncomingFileMeta] = useState<{
    fileId: string;
    fileName: string;
    fileType: string;
    totalChunks: number;
  } | null>(null);
  const [receivedChunks, setReceivedChunks] = useState<ArrayBuffer[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>("");
  const [receiveProgress, setReceiveProgress] = useState(0);

  useEffect(() => {
    console.log(pendingFileMeta, "Pending file meta ma k aauxa hernu paryo");
    if (pendingFileMeta) {
      setIncomingFileMeta({
        fileId: pendingFileMeta.fileId,
        fileName: pendingFileMeta.fileName,
        fileType: pendingFileMeta.fileType,
        totalChunks: pendingFileMeta.totalChunks,
      });
      setPendingFileMeta(null);
    }

    if (pendingChunks.length > 0) {
      setReceivedChunks(pendingChunks);
      setPendingChuncks([]);
    }
  }, []);

  useEffect(() => {
    if (!isReady || !ws.current) return;

    ws.current.send(JSON.stringify({ type: "join", roomId: slug }));

    const handelMessage = (event: MessageEvent) => {
      console.log("Is this function triggered ============");
      console.log(event.type);
      if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
        const toBuffer =
          event.data instanceof Blob
            ? event.data.arrayBuffer()
            : Promise.resolve(event.data);

        toBuffer.then((buffer) => {
          setReceivedChunks((prev) => {
            const updated = [...prev, buffer];
            if (incomingFileMeta) {
              console.log("Yo run huna chai parne ho");
              setReceiveProgress(
                Math.round(
                  (updated.length / incomingFileMeta.totalChunks) * 100
                )
              );
            }
            return updated;
          });
        });
        return;
      }

      const data = JSON.parse(event.data);
      console.log(data, "data in room.tsx");

      if (data.type === "join-ack") {
        setConnected(true);
      }

      if (data.type === "file-meta") {
        setIncomingFileMeta(data);
        setReceivedChunks([]);
        setReceiveProgress(0);
      }

      if (data.type === "file-ready") {
        setDownloadUrl(data.downloadUrl);
        setDownloadFileName(data.fileName);
      }

      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), message: data.message, from: data.from },
        ]);
      }
    };

    ws.current.addEventListener("message", handelMessage);

    return () => {
      if (ws.current) {
        ws.current?.removeEventListener("message", handelMessage);
      }
    };
  }, [isReady]);

  const sendMessage = () => {
    if (!message.trim() || !ws?.current) return;
    if (ws.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected");
      return;
    }

    ws.current.send(JSON.stringify({ type: "message", roomId: slug, message }));
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), message, from: "You" },
    ]);
    setMessage("");
  };

  const copyRoomLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    alert("Room link copied!");
  };

  return (
    <div className="room-container">
      {/* Header */}
      <header className="room-header">
        <div>
          <h2>Room Chat</h2>
          <p className="room-id">ID: {slug}</p>
        </div>

        <div className="room-actions">
          <button onClick={copyRoomLink}>Copy Link</button>
          <span className={`status ${connected ? "online" : "offline"}`}>
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="chat-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>No messages yet</p>
            <span>Start the conversation 👋</span>
          </div>
        )}

        {downloadUrl && (
          <div className="feed-item">
            <div className="file-icon">📥</div>
            <div className="file-info">
              <span className="file-name">{downloadFileName}</span>
              <span className="file-meta">Ready to download</span>
            </div>
            <a
              href={downloadUrl}
              download={downloadFileName}
              className="btn-download"
            >
              Download
            </a>
          </div>
        )}
      </div>

      {receiveProgress > 0 && receiveProgress < 100 && (
        <div>
          <p>Receiving file... {receiveProgress}%</p>
          <div className="progress-mini">
            <div
              className="progress-fill"
              style={{ width: `${receiveProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="input-container">
        <input
          type="text"
          placeholder="Write a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        {/* <button onClick={sendMessage}>Send</button> */}
      </div>
    </div>
  );
}

export default Room;
