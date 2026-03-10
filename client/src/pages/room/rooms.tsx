import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

function Room() {
  const { roomId } = useParams();

  const ws = useRef<WebSocket | null>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (ws.current) return;

    ws.current = new WebSocket("ws://localhost:8080");

    ws.current.onopen = () => {
      setConnected(true);

      ws.current?.send(
        JSON.stringify({
          type: "join",
          roomId: roomId,
        })
      );
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "message") {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    ws.current.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.current?.close();
      ws.current = null;
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!message.trim()) return;

    ws.current?.send(
      JSON.stringify({
        type: "message",
        roomId: roomId,
        message: message,
      })
    );

    setMessage("");
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h2>Room: {roomId}</h2>

      <p>
        Status:{" "}
        {connected ? (
          <span style={{ color: "green" }}>Connected</span>
        ) : (
          <span style={{ color: "red" }}>Disconnected</span>
        )}
      </p>

      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "auto",
          padding: "10px",
          marginBottom: "20px",
        }}
      >
        {messages.length === 0 && <p>No messages yet</p>}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              padding: "6px",
              marginBottom: "6px",
              background: "#f1f1f1",
              borderRadius: "6px",
            }}
          >
            {msg}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Write message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Room;
