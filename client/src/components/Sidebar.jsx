import { useState } from 'react';

export default function Sidebar({ rooms, room, onSelect, onAddRoom, username, onLogout }) {
  const [name, setName] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try { await onAddRoom(name); setName(''); }
    catch (x) { alert(x.message); }
  };

  return (
    <aside className="rooms">
      <h2>Chatterbox</h2>
      <nav>
        {rooms.map((r) => (
          <button key={r._id} className={room?._id === r._id ? 'room active' : 'room'} onClick={() => onSelect(r)}>
            # {r.name}
          </button>
        ))}
      </nav>
      <form onSubmit={submit} className="addroom">
        <input placeholder="New room name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="primary">Add</button>
      </form>
      <div className="me">
        <span>{username}</span>
        <button className="link" onClick={onLogout}>Log out</button>
      </div>
    </aside>
  );
}
