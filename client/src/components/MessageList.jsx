import { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar.jsx';
import { avatarColor } from '../utils/ui.js';

const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function MessageList({ msgs, username, onEdit, onDelete }) {
  const end = useRef();
  const [editing, setEditing] = useState(null); // { id, text }
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length]);

  const save = () => {
    if (editing.text.trim()) onEdit(editing.id, editing.text);
    setEditing(null);
  };

  return (
    <div className="msgs">
      {msgs.length === 0 && <p className="empty">No messages yet. Say hello! 👋</p>}
      {msgs.map((m) => {
        const mine = m.sender === username;
        const isEditing = editing?.id === m._id;
        return (
          <div key={m._id} className={mine ? 'msg mine' : 'msg'}>
            {!mine && <Avatar name={m.sender} />}
            <div className="bubble" style={{ '--c': avatarColor(m.sender) }}>
              {!mine && <b>{m.sender}</b>}
              {isEditing ? (
                <>
                  <input className="editbox" autoFocus value={editing.text} maxLength={1000}
                    onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(null); }} />
                  <div className="editbar">
                    <button onClick={save}>Save</button>
                    <button onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </>
              ) : <p>{m.text}</p>}
              <time>{formatTime(m.createdAt)}{m.edited && ' · edited'}</time>
            </div>
            {mine && !isEditing && (
              <div className="tools">
                <button title="Edit" onClick={() => setEditing({ id: m._id, text: m.text })}>✏️</button>
                <button title="Delete" onClick={() => window.confirm('Delete this message?') && onDelete(m._id)}>🗑️</button>
              </div>
            )}
          </div>
        );
      })}
      <div ref={end} />
    </div>
  );
}
