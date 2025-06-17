import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

// أنماط التطبيق
const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  usernameInput: {
    padding: "10px",
    fontSize: "16px",
    marginBottom: "20px",
    width: "200px",
  },
  chatContainer: {
    border: "1px solid #ddd",
    borderRadius: "5px",
    padding: "20px",
    height: "400px",
    overflowY: "scroll",
    marginBottom: "20px",
  },
  message: {
    marginBottom: "10px",
    padding: "10px",
    backgroundColor: "#f5f5f5",
    borderRadius: "5px",
  },
  messageInput: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    padding: "10px",
    fontSize: "16px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

const App = () => {
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // جلب الرسائل عند التحميل
    axios
      .get("https://test-jiz0.onrender.com/api/messages")
      .then((response) => setMessages(response.data))
      .catch((error) => console.error(error));

    // الاتصال بخادم WebSocket
    const newSocket = io("https://test-jiz0.onrender.com");
    setSocket(newSocket);

    // استقبال الرسائل الجديدة
    newSocket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() && username.trim()) {
      socket.emit("sendMessage", {
        username,
        content: newMessage,
      });
      setNewMessage("");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Simple Chat App</h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your name"
          style={styles.usernameInput}
        />
      </div>

      <div style={styles.chatContainer}>
        {messages.map((msg, index) => (
          <div key={index} style={styles.message}>
            <strong>{msg.username}: </strong>
            {msg.content}
            <div style={{ fontSize: "0.8em", color: "#666" }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.messageInput}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message"
          disabled={!username.trim()}
          style={styles.input}
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || !username.trim()}
          style={styles.button}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default App;
