import Avatar from './Avatar.jsx';

export default function UserList({ users, me, onPick }) {
  return (
    <ul className="users">
      {users.map((u) => (
        <li key={u}>
          <button onClick={() => u !== me && onPick(u)} title={u === me ? 'You' : `Message ${u}`}>
            <Avatar name={u} small />
            <span>{u}{u === me && <small> (you)</small>}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
