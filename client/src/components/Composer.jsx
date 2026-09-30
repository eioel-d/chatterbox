import { useState } from 'react';

export default function Composer({ roomName, onSend, onTyping }) {
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };
  const change = (e) => { setText(e.target.value); onTyping(); };

  return (
    <form className="composer" onSubmit={submit}>
      <input placeholder={`Message #${roomName || ''}`} value={text} onChange={change} maxLength={1000} />
      <button className="primary">Send</button>
    </form>
  );
}
