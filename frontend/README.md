# AI Engineer Challenge - Frontend

A modern, minimalistic chat interface powered by GPT-4.1-nano.

## Features

- 🎨 Modern, minimalistic design with gradient backgrounds
- 💬 Real-time streaming chat interface
- 🔐 Secure API key input (password field)
- 📱 Responsive design
- ⚡ Built with Next.js 14 and styled-components
- 🌈 Beautiful glassmorphism effects

## Setup & Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. Enter your OpenAI API key in the password field
2. Optionally customize the system/developer message
3. Type your message and press Enter or click "Send Message"
4. Watch the AI response stream in real-time!

## API Integration

This frontend connects to the FastAPI backend at `/api/chat` with the following payload:
```json
{
  "developer_message": "System prompt",
  "user_message": "User's question",
  "api_key": "your-openai-api-key"
}
```

## Tech Stack

- **Next.js 14** with App Router
- **React 18** with TypeScript
- **styled-components** for styling
- **Streaming responses** for real-time chat

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint