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
  const { roomId } = useParams();
  const { ws, isReady } = useWebSocket();

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
    if (!isReady || !ws.current) return;

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
      ws.send(JSON.stringify({ type: "join", roomId }));
    };

    ws.current.onmessage = (event) => {
      if (event.data instanceof Blob) {
        event.data.arrayBuffer().then((buffer) => {
          setReceivedChunks((prev) => {
            const updated = [...prev, buffer];
            if (incomingFileMeta) {
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

      if (data.type === "file-meta") {
        setIncomingFileMeta(data);
        setReceivedChunks([]);
        setReceiveProgress(0);
      }

      console.log(data, "data ma type k aairaxa ra lamo");
      if (data.type === "file-ready") {
        setDownloadUrl(data.downloadUrl);
        setDownloadFileName(data.fileName);
      }
    };

    ws.current.onerror = (err) => console.error("WebSocket error:", err);
    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    };

    const currentWs = ws.current;
    return () => currentWs?.close();
  }, [roomId]);

  const sendMessage = () => {
    if (!message.trim() || !ws?.current) return;
    if (ws.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected");
      return;
    }

    ws.current.send(JSON.stringify({ type: "message", roomId, message }));
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
          <p className="room-id">ID: {roomId}</p>
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
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Room;
