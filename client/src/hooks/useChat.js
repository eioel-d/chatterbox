import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API, api } from '../api/client.js';

export default function useChat(token, onLogout) {
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState([]);
  const socket = useRef();
  const timer = useRef();

  useEffect(() => {
    const s = io(API, { auth: { token } });
    socket.current = s;
    s.on('newMessage', (m) => setMsgs((p) => [...p, m]));
    s.on('roomUsers', setUsers);
    s.on('typing', (u) => setTyping((p) => (p.includes(u) ? p : [...p, u])));
    s.on('stopTyping', (u) => setTyping((p) => p.filter((x) => x !== u)));
    s.on('connect_error', onLogout);
    api('/rooms', {}, token).then((r) => { setRooms(r); setRoom(r[0]); }).catch(onLogout);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!room) return;
    setTyping([]);
    api(`/rooms/${room._id}/messages`, {}, token).then(setMsgs);
    socket.current.emit('joinRoom', room._id);
  }, [room]);

  const send = (text) => {
    socket.current.emit('sendMessage', { roomId: room._id, text });
    socket.current.emit('stopTyping', room._id);
  };

  const notifyTyping = () => {
    socket.current.emit('typing', room._id);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => socket.current.emit('stopTyping', room._id), 1500);
  };

  const addRoom = async (name) => {
    const r = await api('/rooms', { method: 'POST', body: { name } }, token);
    setRooms((p) => [...p, r]);
    setRoom(r);
  };

  return { rooms, room, setRoom, msgs, users, typing, send, notifyTyping, addRoom };
}
