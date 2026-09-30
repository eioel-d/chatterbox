import useChat from '../hooks/useChat.js';
import Sidebar from './Sidebar.jsx';
import MessageList from './MessageList.jsx';
import UserList from './UserList.jsx';
import Composer from './Composer.jsx';

export default function ChatView({ session, onLogout }) {
  const { token, username } = session;
  const chat = useChat(token, onLogout);
  const others = chat.typing.filter((u) => u !== username);

  return (
    <div className="app">
      <Sidebar rooms={chat.rooms} room={chat.room} onSelect={chat.setRoom}
        onAddRoom={chat.addRoom} username={username} onLogout={onLogout} />
      <section className="chat">
        <header>
          <h3># {chat.room?.name}</h3>
          <span className="count">{chat.users.length} online</span>
        </header>
        <div className="body">
          <MessageList msgs={chat.msgs} username={username} />
          <UserList users={chat.users} />
        </div>
        <div className="typing">
          {others.length > 0 && `${others.join(', ')} ${others.length > 1 ? 'are' : 'is'} typing…`}
        </div>
        <Composer roomName={chat.room?.name} onSend={chat.send} onTyping={chat.notifyTyping} />
      </section>
    </div>
  );
}
