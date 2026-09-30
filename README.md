# Chatterbox: real-time chat rooms (MERN + Socket.io)

Register/login with JWT, join topic rooms, chat live, see who is online and who is typing. Messages persist in MongoDB and load when you enter a room.

## Run locally
Requires Node 18+ and MongoDB (local or Atlas).

```bash
# terminal 1
cd server && cp .env.example .env && npm install && npm run dev
# terminal 2
cd client && cp .env.example .env && npm install && npm run dev
```
Open http://localhost:5173, create two accounts in two browsers, and chat.

## Stack
- **MongoDB + Mongoose:** `User`, `Room`, `Message`
- **Express:** REST for auth, rooms, message history
- **Socket.io:** rooms, live messages, presence, typing (JWT-authenticated handshake)
- **React (Vite):** login, room list, chat, online list

## Project structure
```
server/
  server.js              entry: HTTP server, sockets, DB connect
  src/
    app.js               Express app and route mounting
    config/              env.js, db.js
    models/              User, Room, Message
    middleware/          auth.js (JWT guard)
    controllers/         authController, roomController
    routes/              authRoutes, roomRoutes
    sockets/             index.js (auth + setup), chatHandlers.js (events, presence)
    utils/               token.js, asyncHandler.js
client/src/
  api/client.js          fetch wrapper
  hooks/                 useSession, useChat (socket + chat state)
  components/            AuthForm, ChatView, Sidebar, MessageList, UserList, Composer
```

## API
`POST /api/register` · `POST /api/login` · `GET/POST /api/rooms` · `GET /api/rooms/:id/messages`

## Socket events
Client → server: `joinRoom`, `leaveRoom`, `sendMessage`, `typing`, `stopTyping`
Server → client: `newMessage`, `roomUsers`, `typing`, `stopTyping`

## Deploy
1. MongoDB Atlas: create a free cluster and copy the connection string.
2. **Server on Render or Railway** (Vercel can't keep WebSocket servers alive). Root: `server`, start: `npm start`. Env: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend URL).
3. **Client on Vercel or Netlify.** Root: `client`, build: `npm run build`, output: `dist`. Env: `VITE_API_URL` (your server URL).

## Future work
Private rooms, direct messages, image sharing, unread badges, rate limiting.
