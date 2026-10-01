import Avatar from './Avatar.jsx';
import { roomLabel } from '../utils/ui.js';

export default function Sidebar({ rooms, room, unread, username, onSelect, onModal }) {
    const item = (r) => (
        <button key={r._id} className={room?._id === r._id ? 'room active' : 'room'} onClick={() => onSelect(r)}>
            <span className="ico">{r.isDM ? <Avatar name={roomLabel(r, username)} small /> : r.isPrivate ? '🔒' : '#'}</span>
            <span className="lbl">{roomLabel(r, username)}</span>
            {unread[r._id] > 0 && <span className="badge">{unread[r._id]}</span>}
        </button>
    );
    const dms = rooms.filter((r) => r.isDM);

    return (
        <aside className="rooms">
            <div className="brand"><span className="logo">💬</span>Chatterbox</div>
            <div className="actions">
                <button onClick={() => onModal('create')}>🏘️ Room</button>
                <button onClick={() => onModal('join')}>🔑 Join</button>
                <button onClick={() => onModal('dm')}>✉️ DM</button>
            </div>
            <h4>Rooms</h4>
            <nav>{rooms.filter((r) => !r.isDM).map(item)}</nav>
            <h4>Direct messages</h4>
            <nav>{dms.map(item)}</nav>
            {!dms.length && <p className="none">Click a name in the online list, or use ✉️ DM.</p>}
        </aside>
    );
}
