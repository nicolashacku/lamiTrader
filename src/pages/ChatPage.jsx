import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Chat from '../components/Chat.jsx';

export default function ChatPage() {
  const { conversationId } = useParams();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading,       setLoading]       = useState(true);

  // Recargar lista cuando se crea una conversación nueva
  // (por ejemplo, al venir desde el mural por primera vez)
  useEffect(() => {
    setLoading(true);
    api.get('/conversations')
      .then(({ data }) => setConversations(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [conversationId]); // re-fetch si cambia la conversación activa

  // Bug fix: comparar siempre como strings para evitar fallos con ObjectId
  const getOtherUser = (conv) =>
    conv.participants?.find((p) => String(p._id) !== String(user._id));

  const selectConv = (id) => navigate(`/chat/${id}`);
  const goBack     = ()   => navigate('/chat');

  // Master-detail: en móvil muestra lista O chat, no ambos
  const showList = !conversationId;
  const showChat = !!conversationId;

  return (
    <div className="max-w-6xl mx-auto px-0 sm:px-4 py-0 sm:py-8 page-enter">
      <h1 className="font-display text-5xl tracking-widest mb-4 sm:mb-6 px-4 sm:px-0 pt-6 sm:pt-0">
        CHATS
      </h1>

      <div
        className="flex border-y-2 sm:border-2 border-ink sm:shadow-card overflow-hidden"
        style={{ height: 'calc(100dvh - 160px)', minHeight: '400px' }}
      >
        {/* ── Sidebar ── */}
        <div className={`flex flex-col bg-paper border-r-2 border-ink overflow-hidden
                          ${showList ? 'flex w-full sm:w-72' : 'hidden sm:flex sm:w-72'}`}>
          <div className="px-4 py-3 border-b-2 border-ink bg-cream shrink-0">
            <p className="font-mono text-xs tracking-widest text-muted">CONVERSACIONES</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-4 border-ink border-t-accent animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="font-mono text-xs text-muted text-center py-8 px-4 leading-relaxed">
                Inicia un chat tocando el ícono 💬 en una lámina del mural.
              </p>
            ) : (
              conversations.map((conv) => {
                const other    = getOtherUser(conv);
                const isActive = conv._id === conversationId;
                return (
                  <button
                    key={conv._id}
                    onClick={() => selectConv(conv._id)}
                    className={`w-full px-4 py-3 flex items-center gap-3 border-b border-ink/10
                                 text-left transition-colors duration-100
                                 ${isActive ? 'bg-ink text-paper' : 'hover:bg-cream'}`}
                  >
                    <div className={`w-9 h-9 shrink-0 flex items-center justify-center
                                     font-display text-xl border-2 transition-colors
                                     ${isActive
                                       ? 'bg-paper text-ink border-paper'
                                       : 'bg-ink text-paper border-ink'}`}>
                      {other?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-body text-sm font-semibold truncate
                                     ${isActive ? 'text-paper' : 'text-ink'}`}>
                        {other?.name || 'Usuario'}
                      </p>
                      <p className={`font-mono text-xs truncate
                                     ${isActive ? 'text-paper/60' : 'text-muted'}`}>
                        {other?.university || '—'}
                      </p>
                    </div>
                    <svg className={`w-4 h-4 ml-auto shrink-0 sm:hidden
                                     ${isActive ? 'text-paper/60' : 'text-muted'}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Panel de chat ── */}
        <div className={`flex-1 flex flex-col overflow-hidden min-h-0
                          ${showChat ? 'flex w-full' : 'hidden sm:flex'}`}>
          <Chat conversationId={conversationId} onBack={goBack} />
        </div>
      </div>
    </div>
  );
}
