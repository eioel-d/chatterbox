import { useState } from 'react';
import useChat from '../hooks/useChat.js';
import Sidebar from './Sidebar.jsx';
import MessageList from './MessageList.jsx';
import UserList from './UserList.jsx';
import Composer from './Composer.jsx';
import Modal from './Modal.jsx';
import Avatar from './Avatar.jsx';
import { roomLabel } from '../utils/ui.js';

export default function ChatView({ session, onLogout }) {
  const { username } = session;
  const chat = useChat(session, onLogout);
  const [modal, setModal] = useState(null);
  const others = chat.typing.filter((u) => u !== username);
  const label = roomLabel(chat.room, username);
  const icon = chat.room?.isDM ? '✉️' : chat.room?.isPrivate ? '🔒' : '#';

  const submit = (v) =>
    modal === 'create' ? chat.addRoom(v.name, v.password)
    : modal === 'join' ? chat.joinPrivate(v.name, v.password)
    : chat.startDM(v.username);

  return (
    <div className="app">
      <Sidebar rooms={chat.rooms} room={chat.room} unread={chat.unread} username={username}
        onSelect={chat.setRoom} onModal={setModal} />
      <section className="chat">
        <header>
          <h3>{icon} {label}</h3>
          <span className="pill">{chat.users.length} online</span>
          <button className="iconbtn" onClick={chat.toggleMute} title={chat.muted ? 'Sound off' : 'Sound on'}>
            {chat.muted ? '🔕' : '🔔'}
          </button>
          <Avatar name={username} small />
          <button className="iconbtn" onClick={onLogout} title="Log out">🚪</button>
        </header>
        <div className="body">
          <MessageList msgs={chat.msgs} username={username} onEdit={chat.editMessage} onDelete={chat.deleteMessage} />
          <UserList users={chat.users} me={username} onPick={(u) => chat.startDM(u).catch((e) => alert(e.message))} />
        </div>
        <div className="typing">
          {others.length > 0 && `${others.join(', ')} ${others.length > 1 ? 'are' : 'is'} typing…`}
        </div>
        <Composer roomName={label} onSend={chat.send} onTyping={chat.notifyTyping} />
      </section>
      {modal && <Modal mode={modal} onClose={() => setModal(null)} onSubmit={submit} />}
    </div>
  );
}
