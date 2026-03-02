import "./dashboard.css";

function Dashboard() {
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
        <nav className="sidebar-nav">
          <p>Connected Peers</p>
          <ul>
            <li>
              <span className="dot online"></span> User_882 (You)
            </li>
            <li>
              <span className="dot online"></span> Sarah_Dev
            </li>
            <li>
              <span className="dot offline"></span> Mike_Ross
            </li>
          </ul>
        </nav>
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
            <div className="dropzone">
              <div className="icon">📂</div>
              <h3>Click or Drag to Upload</h3>
              <p>Supports Any File (Max 50MB for WebSockets)</p>
              <input type="file" className="file-input" />
            </div>
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
      </main>
    </div>
  );
}

export default Dashboard;
