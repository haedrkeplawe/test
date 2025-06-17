const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

// إعداد التطبيق
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// الاتصال بقاعدة البيانات
mongoose
  .connect(
    "mongodb+srv://alihassanhaedr:c4a@cluster0.ue5ezcc.mongodb.net/simple_chat?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// نموذج الرسالة
const MessageSchema = new mongoose.Schema({
  username: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", MessageSchema);

// مسار API لاسترجاع الرسائل
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// معالجة اتصالات WebSocket
io.on("connection", (socket) => {
  console.log("New user connected");

  // استقبال رسالة جديدة
  socket.on("sendMessage", async (data) => {
    try {
      const { username, content } = data;
      if (!username || !content) {
        return;
      }

      const message = new Message({ username, content });
      await message.save();

      // إرسال الرسالة إلى جميع المتصلين
      io.emit("newMessage", message);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// بدء الخادم
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
