import React, { useState, useEffect } from "react";
import { Send, MessageCircle } from "lucide-react";

export interface ChatMessage {
  id: string;
  message: string;
  from: string;
}

interface RoomChatProps {
  initialMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

const RoomChat = ({ initialMessages, onSendMessage }: RoomChatProps) => {
  const [chatMessages, setChatMessages] =
    useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    setChatMessages(initialMessages);
  }, [initialMessages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      borderRadius: "16px",
      backgroundColor: "#ffffff",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      border: "1px solid #f0f0f0",
      overflow: "hidden",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      borderBottom: "1px solid #f0f0f0",
      padding: "16px 20px",
    },
    headerTitle: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#333",
      margin: 0,
    },
    badge: {
      marginLeft: "auto",
      borderRadius: "12px",
      backgroundColor: "rgba(212, 163, 115, 0.1)",
      padding: "2px 8px",
      fontSize: "12px",
      fontWeight: 500,
      color: "#d4a373",
    },
    messageList: {
      flex: 1,
      overflowY: "auto",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    messageWrapper: {
      display: "flex",
      flexDirection: "column",
      maxWidth: "85%",
    },
    userId: {
      fontSize: "10px",
      fontWeight: 500,
      color: "#999",
      marginBottom: "4px",
    },
    bubble: {
      padding: "10px 16px",
      borderRadius: "16px",
      fontSize: "14px",
      lineHeight: "1.4",
      wordBreak: "break-word",
    },
    inputArea: {
      borderTop: "1px solid #f0f0f0",
      padding: "12px",
    },
    inputWrapper: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "#f9f9f9",
      borderRadius: "12px",
      padding: "6px 12px",
    },
    input: {
      flex: 1,
      background: "transparent",
      border: "none",
      outline: "none",
      fontSize: "14px",
      color: "#333",
    },
    sendBtn: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "32px",
      width: "32px",
      borderRadius: "8px",
      backgroundColor: "#d4a373",
      border: "none",
      color: "white",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <MessageCircle size={16} color="#d4a373" />
        <h3 style={styles.headerTitle}>Room Chat</h3>
        <span style={styles.badge}>{chatMessages.length}</span>
      </div>

      <div style={styles.messageList}>
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.messageWrapper,
              // alignSelf: msg.isOwn ? "flex-end" : "flex-start",
              // alignItems: msg.isOwn ? "flex-end" : "flex-start",
            }}
          >
            <span style={styles.userId}>{msg.id.slice(0, 8)}</span>
            <div
              style={{
                ...styles.bubble,
                // backgroundColor: msg.isOwn ? "#d4a373" : "#f1f1f1",
                // color: msg.isOwn ? "#ffffff" : "#333",
                // borderBottomRightRadius: msg.isOwn ? "4px" : "16px",
                // borderBottomLeftRadius: msg.isOwn ? "16px" : "4px",
              }}
            >
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.inputArea}>
        <div style={styles.inputWrapper}>
          <input
            type="text"
            style={styles.input}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
          />
          <button style={styles.sendBtn} onClick={handleSend}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomChat;
