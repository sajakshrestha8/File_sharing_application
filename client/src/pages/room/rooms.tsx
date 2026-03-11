import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./room.css";

interface ChatMessage {
  id: string;
  message: string;
  fileLink?: string;
  from?: string;
}

function Room() {
  const { roomId } = useParams();
  const wsRef = useRef<WebSocket | null>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
      ws.send(JSON.stringify({ type: "join", roomId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), message: data.message, from: data.from },
        ]);
      }

      if (data.type === "file-uploaded") {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            message: data.fileName || `File uploaded: ${data.link}`,
            fileLink: data.link,
            from: data.from,
          },
        ]);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    };

    return () => ws.close();
  }, [roomId]);

  const sendMessage = () => {
    if (!message.trim() || !wsRef.current) return;
    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected");
      return;
    }

    wsRef.current.send(JSON.stringify({ type: "message", roomId, message }));
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

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.from === "You" ? "sent" : "received"}`}
          >
            <div className="message-content">
              <span className="message-text">{msg.message}</span>
              {msg.fileLink && (
                <a
                  href={msg.fileLink}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="file-link"
                >
                  📎 Download
                </a>
              )}
            </div>
            <div className="message-from">{msg.from}</div>
          </div>
        ))}
      </div>

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
