import useSession from './hooks/useSession.js';
import AuthForm from './components/AuthForm.jsx';
import ChatView from './components/ChatView.jsx';

export default function App() {
  const [session, setSession] = useSession();
  return session
    ? <ChatView session={session} onLogout={() => setSession(null)} />
    : <AuthForm onAuth={setSession} />;
}
