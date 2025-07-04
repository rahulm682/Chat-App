# Chat Application

A real-time chat application built with React, Node.js, and Socket.IO.

## Features

- Real-time messaging with Socket.IO
- User authentication and registration
- Message reactions and status indicators
- Typing indicators
- Online/offline user status
- Dark/light theme toggle
- Responsive design with Material-UI
- File upload support with Cloudinary
- Message search and filtering

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) for UI components
- Vite for build tooling
- Socket.IO client for real-time communication
- Axios for HTTP requests

### Backend
- Node.js with Express
- Socket.IO for real-time features
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for file uploads
- bcrypt for password hashing

## Project Structure

```
Chat Application/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React contexts
│   │   ├── pages/          # Page components
│   │   ├── api/            # API configuration
│   │   ├── socket/         # Socket.IO client
│   │   └── types/          # TypeScript types
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── config/             # Configuration files
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Chat Application
```

2. Install dependencies for both client and server:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:

Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Start the development servers:

```bash
# Start the backend server (from server directory)
cd server
npm run dev

# Start the frontend (from client directory, in a new terminal)
cd client
npm run dev
```

The application will be available at:
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
- `POST /api/reactions` - Add a reaction to a message
- `DELETE /api/reactions/:id` - Remove a reaction

## Socket.IO Events

### Client to Server
- `join-chat` - Join a chat room
- `leave-chat` - Leave a chat room
- `typing` - User is typing
- `stop-typing` - User stopped typing
- `new-message` - Send a new message

### Server to Client
- `message-received` - New message received
- `user-typing` - User is typing
- `user-stop-typing` - User stopped typing
- `user-online` - User came online
- `user-offline` - User went offline

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Material-UI for the beautiful UI components
- Socket.IO for real-time communication
- Cloudinary for file upload services 