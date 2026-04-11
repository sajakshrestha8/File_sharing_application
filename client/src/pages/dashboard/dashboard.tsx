import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../../context/websocket.context";
import Navbar from "../../components/Navbar/Navbar";
import FileUploader from "../../components/FileUploader/FileUploader";
import "./dashboard.css";

function Dashboard() {
  const { ws, isReady } = useWebSocket();
  const navigate = useNavigate();

  const [message, setMessage] = useState<string>("");
  const [responseFromServer, setResponseFromServer] = useState<string>("");

  const pendingFileRef = useRef<{
    file: File;
    setProgress: (p: number) => void;
  } | null>(null);

  useEffect(() => {
    if (!isReady || !ws.current) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      // Trigger upload once server confirms room is ready
      if (data?.type === "room-created" && data?.roomId) {
        if (pendingFileRef.current) {
          const { file, setProgress } = pendingFileRef.current;
          startSendingFile(file, data.roomId, setProgress);
        }
      }

      if (data?.type === "file-complete-ack") {
        navigate(`/${data.roomId}`);
      }

      setResponseFromServer(data.message || JSON.stringify(data));
    };

    ws.current.addEventListener("message", handleMessage);
    return () => ws.current?.removeEventListener("message", handleMessage);
  }, [isReady, ws, navigate]);

  const startSendingFile = (
    file: File,
    currentRoomId: string,
    setProgress: (p: number) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("roomId", currentRoomId);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && response.success) {
          navigate(`/${currentRoomId}`);
        } else {
          alert(response.error || "Upload failed");
          setProgress(0);
        }
      } catch (err) {
        console.error("Parse error", err);
      }
    };

    xhr.onerror = () => {
      alert("Network error during upload");
      setProgress(0);
    };

    xhr.open("POST", "http://localhost:8080/files/upload");
    xhr.send(formData);
  };

  const handleShareRequest = async (
    file: File,
    setProgress: (p: number) => void
  ) => {
    if (!ws.current || !isReady) {
      alert("Server connection not ready.");
      return;
    }

    pendingFileRef.current = { file, setProgress };

    ws.current.send(JSON.stringify({ type: "createRoom" }));
  };

  const sendMessage = () => {
    if (message.trim().length === 0 || !ws.current) return;
    ws.current.send(JSON.stringify({ type: "chat", message }));
    setMessage("");
  };

  return (
    <div className="dashboard-container">
      <main className="main-content">
        <Navbar />

        <section className="dashboard-grid">
          <div>
            <FileUploader onShare={handleShareRequest} />
          </div>

          <div className="feed-card">
            <div className="feed-card-header">
              <h3>Recent Activity</h3>
            </div>
            <div className="feed-empty">
              <span className="feed-empty-icon">📭</span>
              No recent transfers yet
            </div>
          </div>
        </section>

        <div className="debug-section">
          <div className="input-group">
            <input
              type="text"
              placeholder="Write a message to server…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="btn-primary" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>

        {responseFromServer && (
          <div className="server-response">
            <p>
              <strong>Server Log:</strong> {responseFromServer}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
