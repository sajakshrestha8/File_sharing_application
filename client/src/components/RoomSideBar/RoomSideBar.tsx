import React from "react";
import { Wifi, Copy, Users } from "lucide-react";

interface RoomSidebarProps {
  roomId: string | undefined;
  isConnected: boolean;
  peerCount: number;
  handleLeaveRoom: () => void;
}

const RoomSidebar = ({
  roomId,
  isConnected,
  peerCount,
  handleLeaveRoom,
}: RoomSidebarProps) => {
  const copyRoomId = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
  };

  const styles: Record<string, React.CSSProperties> = {
    sidebar: {
      display: "flex",
      flexDirection: "column",
      width: "256px",
      gap: "24px",
      borderRadius: "16px",
      backgroundColor: "#ffffff",
      padding: "20px",
      height: "100%",
      border: "1px solid #f0f0f0",
      fontFamily: "system-ui, -apple-system, sans-serif",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
    },
    logoSection: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    logoIconBox: {
      display: "flex",
      height: "36px",
      width: "36px",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "8px",
      backgroundColor: "#d4a373",
    },
    logoText: {
      fontSize: "18px",
      fontWeight: 700,
      color: "#333",
    },
    logoTextHighlight: {
      color: "#d4a373",
    },
    label: {
      fontSize: "11px",
      fontWeight: 500,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: "#999",
      marginBottom: "8px",
    },
    card: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      borderRadius: "8px",
      backgroundColor: "#f9f0e6",
      padding: "10px 12px",
      border: "none",
      width: "100%",
    },
    roomIdBtn: {
      cursor: "pointer",
      textAlign: "left",
      transition: "background-color 0.2s ease",
    },
    roomIdText: {
      flex: 1,
      fontFamily: "ui-monospace, monospace",
      fontSize: "12px",
      color: "#5d4037",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    statusDot: {
      height: "10px",
      width: "10px",
      borderRadius: "50%",
    },
    online: { backgroundColor: "#22c55e" },
    offline: { backgroundColor: "#ef4444" },
    footer: {
      marginTop: "auto",
    },
    leaveBtn: {
      width: "100%",
      padding: "10px",
      backgroundColor: "transparent",
      border: "1px solid #e5d5c5",
      borderRadius: "8px",
      color: "#666",
      cursor: "pointer",
      fontWeight: 500,
    },
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoSection}>
        <div style={styles.logoIconBox}>
          <Wifi size={20} color="#fff" />
        </div>
        <span style={styles.logoText}>
          Cloud<span style={styles.logoTextHighlight}>Drop</span>
        </span>
      </div>

      <div>
        <p style={styles.label}>Room ID</p>
        <button
          onClick={copyRoomId}
          style={{ ...styles.card, ...styles.roomIdBtn }}
        >
          <div style={{ ...styles.statusDot, ...styles.online }} />
          <span style={styles.roomIdText}>{roomId}</span>
          <Copy size={14} color="#999" />
        </button>
      </div>

      <div>
        <p style={styles.label}>Status</p>
        <div style={styles.card}>
          <div
            style={{
              ...styles.statusDot,
              ...(isConnected ? styles.online : styles.offline),
            }}
          />
          <span style={{ fontSize: "14px", fontWeight: 500 }}>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <div>
        <p style={styles.label}>Participants</p>
        <div style={styles.card}>
          <Users size={16} color="#d4a373" />
          <span style={{ fontSize: "14px", fontWeight: 500 }}>
            {peerCount} online
          </span>
        </div>
      </div>

      <div style={styles.footer}>
        <button
          style={styles.leaveBtn}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#f9f0e6")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
          onClick={handleLeaveRoom}
        >
          Leave Room
        </button>
      </div>
    </aside>
  );
};

export default RoomSidebar;
