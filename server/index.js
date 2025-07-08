// index.js
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const socketIo = require("socket.io");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const reactionRoutes = require("./routes/reactionRoutes");
const { setupSocket } = require("./socket").default;
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

// Define allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://chat-app-koqz.vercel.app",
  "http://localhost:5173", // local development URL
];

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { 
    origin: allowedOrigins,
    credentials: true 
  },
});

app.set("io", io);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(errorHandler);

app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reactions", reactionRoutes);

setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {});
