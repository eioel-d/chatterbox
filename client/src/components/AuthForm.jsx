import { useState } from 'react';
import { api } from '../api/client.js';

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try { onAuth(await api(`/${mode}`, { method: 'POST', body: form })); }
    catch (x) { setErr(x.message); }
  };
  const toggle = () => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); };

  return (
    <main className="auth">
      <form onSubmit={submit}>
        <h1>Chatterbox</h1>
        <p>Pick a room, say something, see it land instantly.</p>
        <input placeholder="Username" value={form.username} onChange={set('username')} autoFocus />
        <input type="password" placeholder="Password (6+ characters)" value={form.password} onChange={set('password')} />
        {err && <div className="err">{err}</div>}
        <button className="primary">{mode === 'login' ? 'Log in' : 'Create account'}</button>
        <button type="button" className="link" onClick={toggle}>
          {mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in'}
        </button>
      </form>
    </main>
  );
}
