import { useEffect, useRef, useState } from "react";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../../context/websocket.context";

function Dashboard() {
  const { ws, isReady } = useWebSocket();
  const [message, setMessage] = useState<string>("");
  const [responseFromServer, setResponseFromServer] = useState<string>("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const navigate = useNavigate();

  useEffect(() => {
    // Initalize Websocket connection
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

    return () => {
      ws.current?.removeEventListener("message", handleMessage);
    };
  }, [isReady]);

  const hasStartedSending = useRef(false);

  useEffect(() => {
    if (roomId && file && !isSending && !hasStartedSending.current) {
      hasStartedSending.current = true;
      startSendingFile(roomId);
    }
  }, [roomId]);

  const sendMessage = () => {
    if (message.length <= 0 || !ws) return;
    ws.current?.send(JSON.stringify({ type: "join", message, roomId }));
    setMessage("");
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile?.size > 50 * 1024 * 1024) {
      alert("File size exceeds 50MB limit");
      return;
    }

    setFile(selectedFile);
  };

  const sendFile = () => {
    if (!file || !ws) return;

    if (roomId) {
      if (!hasStartedSending.current) {
        hasStartedSending.current = true;
        startSendingFile(roomId);
      }
      return;
    }

    ws.current?.send(JSON.stringify({ type: "createRoom" }));
  };

  const startSendingFile = (currentRoomId: string | null) => {
    if (!file || !currentRoomId) return;
    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("roomId", currentRoomId);

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);
        console.log({ response });
        if (xhr.status === 200 && response.success) {
          setIsSending(false);
          setUploadProgress(0);

          navigate(`/${currentRoomId}`);
        } else {
          throw new Error(response.error || "Upload failed");
        }
      };

      xhr.onerror = (error) => {
        console.log("facing some errpr", error);
        setIsSending(false);
      };

      // ws.current?.send(JSON.stringify({ type: "" }));
      xhr.open("POST", "http://localhost:8080/files/upload");
      xhr.send(formData);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <h2>
            Cloud<span>Drop</span>
          </h2>
        </div>
        <div className="room-info">
          <label>Active Room</label>
          <div className="room-badge">Global-Share</div>
        </div>
        <nav className="sidebar-nav"></nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-bar">
            <input type="text" placeholder="Search shared files..." />
          </div>
          <button className="btn-primary">Join New Room</button>
        </header>

        <section className="dashboard-grid">
          {/* Upload Card */}
          <div className="upload-card">
            <div className="upload-card-header">
              <h3>Upload File</h3>
            </div>

            {file ? (
              <>
                <div className="file-preview">
                  <div className="file-preview-row">
                    <div className="file-icon-box">📄</div>
                    <div className="file-meta-block">
                      <span className="file-name-text">{file.name}</span>
                      <span className="file-size-text">
                        {(file.size / 1024).toFixed(1)} KB &middot;{" "}
                        {file.type || "Unknown type"}
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
                </div>

                {!isSending && (
                  <div className="upload-card-footer">
                    <button
                      className="btn-primary"
                      onClick={sendFile}
                      disabled={isSending}
                      style={{ width: "100%" }}
                    >
                      Share File
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="dropzone">
                <span className="icon">📂</span>
                <h3>Drop your file here</h3>
                <p>or click to browse &nbsp;·&nbsp; Max 50 MB</p>
                <input
                  type="file"
                  className="file-input"
                  onChange={(e) => handleFileInput(e)}
                />
              </div>
            )}
          </div>

          {/* Activity Feed */}
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

        {/* Debug / Message Section */}
        <div className="debug-section">
          <label htmlFor="message">Message</label>
          <input
            id="message"
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

        {responseFromServer && (
          <div className="server-response">
            <label>Server: {responseFromServer}</label>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
