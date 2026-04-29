import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Chat from '../components/Chat.jsx';

export default function ChatPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/conversations')
      .then(({ data }) => setConversations(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectConversation = (id) => navigate(`/chat/${id}`);

  const getOtherUser = (conv) =>
    conv.participants?.find((p) => p._id !== user._id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 page-enter">
      <h1 className="font-display text-5xl tracking-widest mb-6">CHATS</h1>

      <div className="flex border-2 border-ink shadow-card" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        {/* Sidebar */}
        <div className="w-72 shrink-0 border-r-2 border-ink flex flex-col overflow-hidden bg-paper">
          <div className="px-4 py-3 border-b-2 border-ink bg-cream">
            <p className="font-mono text-xs tracking-widest text-muted">CONVERSACIONES</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-4 border-ink border-t-accent animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="font-mono text-xs text-muted text-center py-8 px-4">
                Inicia un chat desde el mural tocando el ícono de mensaje en una lámina.
              </p>
            ) : (
              conversations.map((conv) => {
                const other = getOtherUser(conv);
                const isActive = conv._id === conversationId;
                return (
                  <button
                    key={conv._id}
                    onClick={() => selectConversation(conv._id)}
                    className={`w-full px-4 py-3 flex items-center gap-3 border-b border-ink/10
                                 text-left transition-colors duration-100
                                 ${isActive ? 'bg-ink text-paper' : 'hover:bg-cream'}`}
                  >
                    <div className={`w-9 h-9 shrink-0 flex items-center justify-center font-display text-xl border-2
                                     ${isActive ? 'bg-paper text-ink border-paper' : 'bg-ink text-paper border-ink'}`}>
                      {other?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-body text-sm font-semibold truncate ${isActive ? 'text-paper' : 'text-ink'}`}>
                        {other?.name || 'Usuario'}
                      </p>
                      <p className={`font-mono text-xs truncate ${isActive ? 'text-paper/60' : 'text-muted'}`}>
                        {other?.university}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        <Chat conversationId={conversationId} />
      </div>
    </div>
  );
}
