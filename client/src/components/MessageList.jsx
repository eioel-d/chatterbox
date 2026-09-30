import { useEffect, useRef } from 'react';

const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function MessageList({ msgs, username }) {
  const end = useRef();
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  return (
    <div className="msgs">
      {msgs.length === 0 && <p className="empty">No messages yet. Say hello to start the room.</p>}
      {msgs.map((m) => (
        <div key={m._id} className={m.sender === username ? 'msg mine' : 'msg'}>
          {m.sender !== username && <b>{m.sender}</b>}
          <p>{m.text}</p>
          <time>{formatTime(m.createdAt)}</time>
        </div>
      ))}
      <div ref={end} />
    </div>
  );
}
