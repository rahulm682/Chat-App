# Chat Application

A real-time chat application built with React, Node.js, Socket.IO, and MongoDB.

## Features

### ✅ Implemented
- User authentication & registration (JWT-based)
- Real-time messaging (Socket.IO)
- Message reactions (add/update/remove, real-time sync, optimistic UI)
- Typing indicators
- Online/offline user status
- Dark/light theme toggle
- Responsive Material-UI design
- Chat list & unread counts
- User search & new chat creation
- Date separators in message list
- Context-based state (theme, online users)
- Redux Toolkit state (chats, messages, users, online users)

### 🚧 Not Yet Implemented / Partial
- File uploads (Cloudinary backend ready, no UI/attachment support)
- Message search & filtering (no UI)
- Group chat management (no add/remove users, group names)
- Notifications (no in-app or push notifications)
- Message editing/deleting (no UI)
- Profile editing (no UI for editing user profile/avatar)
- Advanced read receipts (no per-user read receipts)
- Chat settings/management (no UI)
- Media previews (no image/video preview in chat)
- Message pagination/infinite scroll (basic pagination only)

## Performance Optimizations

- **Virtualized message list:** Only visible messages are rendered, enabling smooth performance even with thousands of messages.
- **Infinite scroll:** Older messages are loaded as you scroll up, with seamless pagination.
- **Memoization:** Components like messages, reactions, and chat list items are memoized to prevent unnecessary re-renders.
- **Optimistic UI:** Reactions update instantly in the UI before server confirmation, then sync with the backend.
- **Dynamic row height:** Message rows adjust their height based on content, reactions, and date separators, preventing overlap and layout issues.

## Tech Stack

### Frontend
- React 18 (TypeScript)
- Material-UI (MUI)
- Vite
- Redux Toolkit
- Socket.IO Client
- React Router DOM
- React Hook Form
- React Toastify
- Emoji Mart
- Emotion (styling)

### Backend
- Node.js + Express
- Socket.IO
- MongoDB + Mongoose
- JWT (authentication)
- Cloudinary (file upload, backend only)
- bcryptjs (password hashing)
- Multer (file upload middleware, backend only)
- dotenv (environment variables)
- CORS

## Project Structure

```
Chat Application/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React contexts
│   │   ├── pages/          # Page components
│   │   ├── api/            # API config
│   │   ├── socket/         # Socket.IO client
│   │   └── types/          # TypeScript types
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── config/             # Config files
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd Chat Application
```

2. **Install dependencies for both client and server:**
```bash
# Client
cd client
npm install

# Server
cd ../server
npm install
```

3. **Set up environment variables:**

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. **Start the development servers:**
```bash
# Backend (from server directory)
cd server
npm run dev

# Frontend (from client directory, in a new terminal)
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create a new chat
- `GET /api/chats/:id` - Get chat details

### Messages
- `GET /api/messages/:chatId` - Get messages for a chat
- `POST /api/messages` - Send a new message
- `PUT /api/messages/:id` - Update a message

### Reactions
- `POST /api/reactions` - Add or update a reaction to a message
- `DELETE /api/reactions/:messageId` - Remove your reaction from a message

## Socket.IO Events

### Client to Server
- `join-chat` - Join a chat room
- `leave-chat` - Leave a chat room
- `typing` - User is typing
- `stop-typing` - User stopped typing
- `new-message` - Send a new message

### Server to Client
- `message-received` - New message received
- `reaction-added` - Reaction added/updated on a message
- `reaction-removed` - Reaction removed from a message
- `user-typing` - User is typing
- `user-stop-typing` - User stopped typing
- `user-online` - User came online
- `user-offline` - User went offline

## Troubleshooting

- **Real-time features not working?**
  - Ensure both frontend and backend are running and can connect to each other.
  - Check your browser console and server logs for errors.
  - Make sure MongoDB is running and accessible.
- **Reactions not updating in real time?**
  - Make sure you are running the latest code. Socket events and cache updates are required for real-time reaction sync.
- **File uploads not working?**
  - Check your Cloudinary credentials in the `.env` file.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Material-UI for UI components
- Socket.IO for real-time communication
- Cloudinary for file upload services 