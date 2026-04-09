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
  const [roomId, setRoomId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const hasStartedSending = useRef(false);

  useEffect(() => {
    if (!isReady || !ws.current) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data?.type === "room-created" && data?.roomId) {
        setRoomId(data.roomId);
      }

      if (data?.type === "file-complete-ack") {
        navigate(`/${data.roomId}`);
      }
      setResponseFromServer(data.message || JSON.stringify(data));
    };

    ws.current.addEventListener("message", handleMessage);
    return () => ws.current?.removeEventListener("message", handleMessage);
  }, [isReady, ws, navigate]);

  useEffect(() => {
    if (roomId && file && !isSending && !hasStartedSending.current) {
      hasStartedSending.current = true;
      startSendingFile(roomId);
    }
  }, [roomId, file, isSending]);

  const handleFileSelection = (files: FileList) => {
    const selectedFile = files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 50 * 1024 * 1024) {
      alert("File size exceeds 50MB limit");
      return;
    }

    setFile(selectedFile);
  };

  const initiateShare = () => {
    if (!file || !ws.current) return;

    if (roomId) {
      if (!hasStartedSending.current) {
        hasStartedSending.current = true;
        startSendingFile(roomId);
      }
    } else {
      ws.current.send(JSON.stringify({ type: "createRoom" }));
    }
  };

  const startSendingFile = (currentRoomId: string) => {
    if (!file) return;
    setIsSending(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("roomId", currentRoomId);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && response.success) {
          setIsSending(false);
          setUploadProgress(0);
          navigate(`/${currentRoomId}`);
        } else {
          alert(response.error || "Upload failed");
          setIsSending(false);
        }
      } catch (err) {
        console.error("Parse error", err);
        setIsSending(false);
      }
    };

    xhr.onerror = () => {
      alert("Network error during upload");
      setIsSending(false);
    };

    xhr.open("POST", "http://localhost:8080/files/upload");
    xhr.send(formData);
  };

  const sendMessage = () => {
    if (message.trim().length === 0 || !ws.current) return;
    ws.current.send(JSON.stringify({ type: "join", message, roomId }));
    setMessage("");
  };

  const resetSelection = () => {
    setFile(null);
    setRoomId(null);
    hasStartedSending.current = false;
    setUploadProgress(0);
  };

  return (
    <div className="dashboard-container">
      <main className="main-content">
        <header className="top-bar">
          <div className="search-bar">
            <input type="text" placeholder="Search shared files..." />
          </div>
          <button className="btn-primary">Join New Room</button>
        </header>

        <Navbar />

        <section className="dashboard-grid">
          <div className="upload-section">
            {!file ? (
              <FileUploader onFileSelect={handleFileSelection} />
            ) : (
              <div className="upload-card">
                <div className="upload-card-header">
                  <h3>Selected File</h3>
                </div>
                <div className="file-preview">
                  <div className="file-preview-row">
                    <div className="file-icon-box">📄</div>
                    <div className="file-meta-block">
                      <span className="file-name-text">{file.name}</span>
                      <span className="file-size-text">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB &middot;{" "}
                        {file.type || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {isSending && (
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-label">
                        <span>Uploading…</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="progress-mini">
                        <div
                          className="progress-fill"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {!isSending && (
                    <div className="upload-actions">
                      <button className="btn-primary" onClick={initiateShare}>
                        Share File
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={resetSelection}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
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
