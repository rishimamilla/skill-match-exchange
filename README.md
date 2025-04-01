# Skill Match Exchange

A modern skill barter system that allows users to exchange skills and knowledge with others in their community.

## Features

- 🔐 User Authentication & Authorization
- 👥 User Profiles with Skill Verification
- 🔍 Advanced Skill Matching Algorithm
- 💬 Real-time Chat System
- ⭐ Rating and Review System
- 📱 Mobile-responsive Design
- 🌓 Dark/Light Mode
- 🔔 Push Notifications
- 🔒 Secure API with Rate Limiting
- 📊 Analytics Dashboard

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io for real-time features
- JWT for authentication
- Cloudinary for image uploads

### Frontend
- React.js
- Tailwind CSS
- Redux Toolkit
- Socket.io Client
- React Router
- Axios

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Cloudinary account (for image uploads)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/skill-match-exchange.git
cd skill-match-exchange
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skill-match-exchange
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Documentation

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- PUT /api/auth/profile - Update user profile

### Skills
- GET /api/skills - Get all skills with filters
- GET /api/skills/:id - Get skill by ID
- POST /api/skills - Create new skill
- PUT /api/skills/:id - Update skill
- DELETE /api/skills/:id - Delete skill
- GET /api/skills/matches - Find matching skills
- POST /api/skills/:id/reviews - Add review to skill

### Chat
- GET /api/chat - Get all chats
- GET /api/chat/:id - Get chat by ID
- POST /api/chat - Create new chat
- POST /api/chat/:id/messages - Send message
- PUT /api/chat/:id/read - Mark chat as read

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.io](https://socket.io/)
