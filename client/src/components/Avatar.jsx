import { avatarColor } from '../utils/ui.js';

export default function Avatar({ name = '?', small }) {
  return (
    <span className={small ? 'avatar sm' : 'avatar'} style={{ background: avatarColor(name) }}>
      {name[0]?.toUpperCase()}
    </span>
  );
}
