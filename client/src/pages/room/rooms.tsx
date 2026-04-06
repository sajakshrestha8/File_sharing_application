import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useWebSocket } from "../../context/websocket.context";

interface ChatMessage {
  id: string;
  message: string;
  from?: string;
}

interface FileInfo {
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
}

function Room() {
  const { slug } = useParams();
  const { ws, isReady } = useWebSocket();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

  useEffect(() => {
    if (!isReady || !ws.current) return;
    if (!slug) {
      console.error("No roomId in URL");
      return;
    }

    console.log("Joining room:", slug);
    ws.current.send(JSON.stringify({ type: "join", roomId: slug }));

    const handleMessage = (event: MessageEvent) => {
      if (event.data instanceof Blob || event.data instanceof ArrayBuffer)
        return;

      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.error("Failed to parse message:", e);
        return;
      }

      console.log("Room received:", data);

      if (data.type === "join-ack") {
        console.log("✅ Joined room:", data.roomId);
        setConnected(true);
      }

      if (data.type === "file-ready") {
        console.log("📥 File ready:", data.downloadUrl);
        setFileInfo({
          fileName: data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize,
          downloadUrl: data.downloadUrl,
        });
      }

      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), message: data.message, from: data.from },
        ]);
      }
    };

    ws.current.addEventListener("message", handleMessage);

    return () => {
      ws.current?.removeEventListener("message", handleMessage);
    };
  }, [isReady, slug]);

  const sendMessage = () => {
    if (!message.trim() || !ws.current) return;
    ws.current.send(JSON.stringify({ type: "message", message, roomId: slug }));
    setMessage("");
  };

  console.log({ fileInfo });

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">
          <h2>
            Cloud<span>Drop</span>
          </h2>
        </div>
        <div className="room-info">
          <label>Room ID</label>
          <div className="room-badge">{slug || "Unknown"}</div>
        </div>
        <div className="room-info">
          <label>Status</label>
          <div className="room-badge">
            {connected ? "🟢 Connected" : "🔴 Connecting..."}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="search-bar">
            <input type="text" placeholder="Room activity..." readOnly />
          </div>
        </header>

        <section className="dashboard-grid">
          <div className="upload-card">
            <div className="upload-card-header">
              <h3>Shared File</h3>
            </div>

            {fileInfo ? (
              <div className="file-preview">
                <div className="file-preview-row">
                  <div className="file-icon-box">📥</div>
                  <div className="file-meta-block">
                    <span className="file-name-text">{fileInfo.fileName}</span>
                    <span className="file-size-text">
                      {fileInfo.fileSize
                        ? `${(fileInfo.fileSize / 1024).toFixed(1)} KB · `
                        : ""}
                      {fileInfo.fileType || "Unknown type"}
                    </span>
                  </div>
                </div>
                <div className="upload-card-footer">
                  <a
                    href={fileInfo.downloadUrl}
                    download={fileInfo.fileName}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      textAlign: "center",
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    ⬇ Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="dropzone">
                <span className="icon">⏳</span>
                <h3>Waiting for file...</h3>
                <p>The sender will share a file shortly</p>
              </div>
            )}
          </div>

          <div className="feed-card">
            <div className="feed-card-header">
              <h3>Room Chat</h3>
            </div>

            <div className="feed-list">
              {messages.length === 0 ? (
                <div className="feed-empty">
                  <span className="feed-empty-icon">📭</span>
                  No messages yet
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="feed-item">
                    <span className="feed-from">{msg.from?.slice(0, 8)}:</span>
                    <span className="feed-message">{msg.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <div className="debug-section">
          <label htmlFor="room-message">Message</label>
          <input
            id="room-message"
            type="text"
            placeholder="Write a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="btn-primary" onClick={sendMessage}>
            Send
          </button>
        </div>
      </main>
    </div>
  );
}

export default Room;
