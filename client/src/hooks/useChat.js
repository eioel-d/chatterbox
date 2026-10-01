import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API, api } from '../api/client.js';
import { playPing } from '../utils/sound.js';

export default function useChat({ token, username }, onLogout) {
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState([]);
  const [unread, setUnread] = useState({});
  const [notice, setNotice] = useState('');
  const [muted, setMuted] = useState(() => localStorage.getItem('muted') === '1');
  const socket = useRef();
  const timer = useRef();
  const live = useRef({}); // latest state for socket callbacks
  live.current = { rooms, room, muted };

  const watch = (list) => socket.current?.emit('watchRooms', list.filter((r) => !r.isDM).map((r) => r._id));
  const addRooms = (list) => {
    setRooms((p) => [...p, ...list.filter((r) => !p.some((x) => x._id === r._id))]);
    watch(list);
  };
  const refreshRooms = () => api('/rooms', {}, token).then((r) => { setRooms(r); watch(r); return r; });

  const flash = (text) => { setNotice(text); setTimeout(() => setNotice(''), 4000); };
  const applyUpdate = (r) => {
    setRooms((p) => p.map((x) => (x._id === r._id ? r : x)));
    setRoom((cur) => (cur?._id === r._id ? r : cur));
  };
  const applyDelete = (id) => {
    const { room, rooms } = live.current;
    if (room?._id === id) flash(`The room #${room.name} was deleted`);
    setRooms((p) => p.filter((x) => x._id !== id));
    setRoom((cur) => (cur?._id === id ? rooms.find((x) => x._id !== id && !x.isDM) || null : cur));
  };

  useEffect(() => {
    const s = io(API, { auth: { token } });
    socket.current = s;
    s.on('newMessage', (m) => setMsgs((p) => [...p, m]));
    s.on('roomUsers', setUsers);
    s.on('typing', (u) => setTyping((p) => (p.includes(u) ? p : [...p, u])));
    s.on('stopTyping', (u) => setTyping((p) => p.filter((x) => x !== u)));
    s.on('roomCreated', (r) => addRooms([r]));
    s.on('messageEdited', (m) => setMsgs((p) => p.map((x) => (x._id === m._id ? m : x))));
    s.on('messageDeleted', (id) => setMsgs((p) => p.filter((x) => x._id !== id)));
    s.on('roomUpdated', applyUpdate);
    s.on('roomDeleted', ({ id }) => applyDelete(id));
    s.on('notify', (n) => {
      if (n.sender === username) return;
      const { rooms, room, muted } = live.current;
      if (!rooms.some((r) => r._id === n.roomId)) refreshRooms(); // e.g. someone started a DM with you
      if (n.roomId === room?._id && !document.hidden) return;
      setUnread((p) => ({ ...p, [n.roomId]: (p[n.roomId] || 0) + 1 }));
      if (!muted) playPing();
    });
    s.on('connect_error', onLogout);
    refreshRooms().then((r) => setRoom(r.find((x) => !x.isDM) || r[0])).catch(onLogout);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!room) { setMsgs([]); return; }
    setTyping([]);
    setMsgs([]);
    setUnread((p) => ({ ...p, [room._id]: 0 }));
    api(`/rooms/${room._id}/messages`, {}, token).then(setMsgs).catch(() => {});
    socket.current.emit('joinRoom', room._id);
  }, [room?._id]); // renaming a room must not reload its history

  useEffect(() => {
    const clear = () => {
      const cur = live.current.room;
      if (!document.hidden && cur) setUnread((p) => ({ ...p, [cur._id]: 0 }));
    };
    document.addEventListener('visibilitychange', clear);
    return () => document.removeEventListener('visibilitychange', clear);
  }, []);

  useEffect(() => {
    const total = Object.values(unread).reduce((a, b) => a + b, 0);
    document.title = total ? `(${total}) Chatterbox` : 'Chatterbox';
  }, [unread]);

  const send = (text) => {
    socket.current.emit('sendMessage', { roomId: room._id, text });
    socket.current.emit('stopTyping', room._id);
  };
  const notifyTyping = () => {
    socket.current.emit('typing', room._id);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => socket.current.emit('stopTyping', room._id), 1500);
  };
  const open = async (path, body) => {
    const r = await api(path, { method: 'POST', body }, token);
    addRooms([r]);
    setRoom(r);
  };
  const toggleMute = () => setMuted((m) => { localStorage.setItem('muted', m ? '0' : '1'); return !m; });

  return {
    rooms, room, setRoom, msgs, users, typing, unread, muted, toggleMute, send, notifyTyping,
    addRoom: (name, password) => open('/rooms', { name, password }),
    joinPrivate: (name, password) => open('/rooms/join', { name, password }),
    startDM: (username) => open('/rooms/dm', { username }),
    editMessage: (id, text) => socket.current.emit('editMessage', { id, text }),
    deleteMessage: (id) => socket.current.emit('deleteMessage', id),
    notice,
    renameRoom: (id, name) => api(`/rooms/${id}`, { method: 'PATCH', body: { name } }, token).then(applyUpdate),
    deleteRoom: (id) => api(`/rooms/${id}`, { method: 'DELETE' }, token).then(() => applyDelete(id)),
  };
}
