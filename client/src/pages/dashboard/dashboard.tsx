import { useEffect, useRef, useState } from "react";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const ws = useRef<WebSocket | null>(null);
  const [message, setMessage] = useState<string>("");
  const [responseFromServer, setResponseFromServer] = useState<string>("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Initalize Websocket connection
    ws.current = new WebSocket("ws://localhost:8080");

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.roomId) {
        setRoomId(data.roomId);
        navigate(`/${data.roomId}`);
      }
      console.log(event);
      setResponseFromServer(data.message || JSON.stringify(data));
    };
  }, [navigate, roomId]);

  const sendMessage = () => {
    if (message.length <= 0) return;
    ws.current?.send(JSON.stringify({ type: "join", message, roomId }));
    setMessage("");
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files, "File targets");
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    console.log({ selectedFile });

    if (selectedFile?.size > 50 * 1024 * 1024) {
      alert("File size exceeds 50MB limit");
      return;
    }

    setFile(selectedFile);
  };

  const sendFile = () => {
    console.log(roomId);
    if (!roomId) {
      ws.current?.send(
        JSON.stringify({
          type: "createRoom",
          message: "Please I want to create room with you",
        })
      );
    }

    if (!file) return;
    setIsSending(true);

    const CHUNK_SIZE = 64 * 1024;
    const totalChuncks = Math.ceil(file.size / CHUNK_SIZE);
    const fileId = crypto.randomUUID();
    let chuckIndex = 0;

    ws.current?.send(
      JSON.stringify({
        type: "file-meta",
        roomId,
        fileId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        totalChuncks,
      })
    );

    console.log("File is about to take off mannnnnnnnnnn");
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">
          <h2>
            Cloud<span>Drop</span>
          </h2>
        </div>
        <div className="room-info">
          <label>Active Room</label>
          <div className="room-badge"># Global-Share</div>
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
          {/* Upload Area */}
          <div className="upload-card">
            {file ? (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "#f8fafc",
                  borderRadius: "8px",
                }}
              >
                <p>
                  📄 <strong>{file.name}</strong>
                </p>
                <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  {(file.size / 1024).toFixed(1)} KB •{" "}
                  {file.type || "Unknown type"}
                </p>

                {isSending && (
                  <div>
                    <div
                      className="progress-mini"
                      style={{ marginTop: "0.5rem" }}
                    >
                      <div
                        className="progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p style={{ fontSize: "0.75rem" }}>
                      {uploadProgress}% uploaded
                    </p>
                  </div>
                )}

                {!isSending && (
                  <button
                    className="btn-primary"
                    onClick={sendFile}
                    disabled={isSending}
                  >
                    Share file
                  </button>
                )}
              </div>
            ) : (
              <div className="dropzone">
                <div className="icon">📂</div>
                <h3>Click or Drag to Upload</h3>
                <p>Supports Any File (Max 50MB for WebSockets)</p>
                <input
                  type="file"
                  className="file-input"
                  onChange={(e) => handleFileInput(e)}
                />
              </div>
            )}
          </div>

          {/* Activity/Transfer Feed */}
          <div className="feed-card">
            <h3>Recent Activity</h3>
            {/* <div className="feed-list">
              <div className="feed-item">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <span className="file-name">Project_Requirements.pdf</span>
                  <span className="file-meta">2.4 MB • From Sarah_Dev</span>
                </div>
                <button className="btn-download">Download</button>
              </div>

              <div className="feed-item">
                <div className="file-icon">🖼️</div>
                <div className="file-info">
                  <span className="file-name">Dashboard_Final.png</span>
                  <span className="file-meta">850 KB • Uploading...</span>
                </div>
                <div className="progress-mini">
                  <div className="progress-fill" style={{ width: "65%" }}></div>
                </div>
              </div>
            </div> */}
            <div>Loading....</div>
          </div>
        </section>
        <div>
          <label htmlFor="message">Write a message for server</label>
          <input
            type="text"
            placeholder="Write a message "
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendMessage}>send</button>
        </div>
        <div>
          <label htmlFor="responseFromServer">
            The response from the server is: {responseFromServer}
          </label>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
