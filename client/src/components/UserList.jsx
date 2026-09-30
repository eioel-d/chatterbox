export default function UserList({ users }) {
  return (
    <ul className="users">
      {users.map((u) => <li key={u}>{u}</li>)}
    </ul>
  );
}
