import { useState } from 'react';

const MODES = {
  create: { title: 'Create a room', hint: 'Add a password to make it private. Only people with the password can join.', cta: 'Create',
    fields: [['name', 'Room name', 'text'], ['password', 'Password (optional)', 'password']] },
  join: { title: 'Join a private room', hint: 'Enter the room name and the password you were given.', cta: 'Join',
    fields: [['name', 'Room name', 'text'], ['password', 'Password', 'password']] },
  rename: { title: 'Rename room', hint: 'Everyone in the room will see the new name.', cta: 'Save',
    fields: [['name', 'New room name', 'text']] },
  dm: { title: 'New direct message', hint: 'Chat 1-to-1 with another user.', cta: 'Start chat',
    fields: [['username', 'Their username', 'text']] },
};

export default function Modal({ mode, initial, onClose, onSubmit }) {
  const cfg = MODES[mode];
  const [vals, setVals] = useState(initial || {});
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try { await onSubmit(vals); onClose(); }
    catch (x) { setErr(x.message); }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{cfg.title}</h3>
        <p className="hint">{cfg.hint}</p>
        {cfg.fields.map(([key, label, type], i) => (
          <input key={key} type={type} placeholder={label} value={vals[key] || ''} autoFocus={i === 0}
            onChange={(e) => setVals({ ...vals, [key]: e.target.value })} />
        ))}
        {err && <div className="err">{err}</div>}
        <div className="row">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button className="primary">{cfg.cta}</button>
        </div>
      </form>
    </div>
  );
}
