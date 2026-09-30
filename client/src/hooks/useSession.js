import { useState } from 'react';

const KEY = 'session';

export default function useSession() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem(KEY) || 'null'));
  const save = (s) => {
    s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY);
    setSession(s);
  };
  return [session, save];
}
