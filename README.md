# Human or AI 🤖👤 (backend is down)

A real-time chat application that challenges users to distinguish between human and AI participants in anonymous 1-minute conversations.

## 🎯 Overview

Human or AI is an interactive chat platform where users enter rooms and engage in anonymous conversations for exactly 60 seconds. After the chat ends, participants must guess whether they were talking to a human or an AI. Test your ability to detect artificial intelligence in natural conversation!

## ✨ Features

- **Anonymous Chat Rooms**: Enter random chat rooms with complete anonymity
- **60-Second Timer**: Precisely timed conversations to maintain engagement
- **Human vs AI Detection**: Challenge yourself to identify your chat partner
- **Real-time Communication**: Instant messaging powered by WebSocket technology
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **AI Integration**: Sophisticated AI responses powered by Gemini AI
- **Score Tracking**: Keep track of your detection accuracy

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI library for building interactive interfaces
- **TypeScript** - Type-safe JavaScript for a better development experience
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Shadcn/ui** - High-quality, accessible React components
- **Aceternity UI** - Beautiful, animated UI components

### Backend
- **Node.js** - JavaScript runtime for server-side development
- **TypeScript** - Type-safe backend development
- **Socket.io** - Real-time bidirectional event-based communication
- **Prisma** - Object relational mapper
- **Postgres** - SQL database

### AI Integration
- **Gemini AI** - Advanced AI model for generating human-like responses

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Gemini AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/human-or-ai.git
   cd human-or-ai
   ```

2. **Install dependencies**

   For the frontend:
   ```bash
   cd client
   npm install
   ```

   For the backend:
   ```bash
   cd server
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the server directory:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

   Create a `.env.local` file in the client directory:
   ```env
   REACT_APP_SERVER_URL=http://localhost:5000
   ```

4. **Start the development servers**

   Backend (from server directory):
   ```bash
   npm run dev
   ```

   Frontend (from client directory):
   ```bash
   npm start
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000` to start using the application.

## 📱 How to Play

1. **Enter a Room**: Click "Join Random Room" to be matched with another participant
2. **Chat Away**: You have exactly 60 seconds to have a conversation
3. **Make Your Guess**: After the timer ends, decide if your partner was human or AI
4. **See Results**: Find out if you were correct and view your accuracy score
5. **Play Again**: Jump into another room to test your skills further

## 🔧 Available Scripts

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Lint code

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

## 🎨 UI Components

This project leverages modern UI libraries for a polished experience:

- **Shadcn/ui**: Provides accessible, customizable components
- **Aceternity UI**: Adds beautiful animations and modern design elements
- **Tailwind CSS**: Enables rapid, responsive styling

## 🤖 AI Integration

The application uses Gemini AI to power intelligent responses. The AI is designed to:

- Engage in natural, human-like conversations
- Adapt to different conversation styles
- Maintain consistency throughout the chat
- Provide challenging interactions that test human detection skills

## 🔐 Privacy & Security

- **No Data Storage**: Conversations are not stored permanently
- **Anonymous Interactions**: No personal information is required or tracked
- **Secure Connections**: All communications are encrypted
- **Rate Limiting**: Protection against spam and abuse

## If you encounter any issues or have questions:
- Open an issue on GitHub
