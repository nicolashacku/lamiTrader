import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../hooks/useSocket.js';

/**
 * Chat — panel de mensajería en tiempo real.
 * Props:
 *  - conversationId  string | undefined
 *  - onBack          callback para volver a la lista en móvil
 */
export default function Chat({ conversationId, onBack }) {
  const { user }   = useAuth();
  const socket     = useSocket();
  const [conversation, setConversation] = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [text,         setText]         = useState('');
  const [isTyping,     setIsTyping]     = useState(false);
  const [loading,      setLoading]      = useState(true);
  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);
  const textareaRef = useRef(null);

  const otherUser = conversation?.participants?.find((p) => p._id !== user._id);

  // ── Cargar conversación ────────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId) { setLoading(false); return; }
    setLoading(true);
    api.get(`/conversations/${conversationId}`)
      .then(({ data }) => {
        setConversation(data);
        setMessages(data.messages || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [conversationId]);

  // ── Socket: unirse a sala y escuchar mensajes ───────────────────────────────
  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit('join_conversation', conversationId);

    const onMessage = ({ conversationId: cid, message }) => {
      if (cid === conversationId) setMessages((prev) => [...prev, message]);
    };
    const onTyping = ({ userId, isTyping: t }) => {
      if (userId !== user._id) setIsTyping(t);
    };

    socket.on('receive_message', onMessage);
    socket.on('typing', onTyping);
    return () => {
      socket.off('receive_message', onMessage);
      socket.off('typing', onTyping);
    };
  }, [socket, conversationId, user._id]);

  // ── Scroll al último mensaje ───────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Enviar mensaje ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    if (!text.trim() || !socket) return;
    const trimmed = text.trim();

    // Optimistic update (solo para el sender)
    setMessages((prev) => [
      ...prev,
      { _id: `opt-${Date.now()}`, sender: { _id: user._id }, text: trimmed, createdAt: new Date() },
    ]);
    setText('');
    textareaRef.current?.focus();

    socket.emit('send_message', { conversationId, senderId: user._id, text: trimmed });
    socket.emit('typing', { conversationId, userId: user._id, isTyping: false });
  }, [text, socket, conversationId, user._id]);

  const handleTyping = (val) => {
    setText(val);
    if (!socket) return;
    socket.emit('typing', { conversationId, userId: user._id, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(
      () => socket.emit('typing', { conversationId, userId: user._id, isTyping: false }),
      1500
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Sin conversación seleccionada ──────────────────────────────────────────
  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-cream">
        <div className="text-center px-6">
          <div className="w-14 h-14 border-4 border-ink/10 mx-auto mb-3 flex items-center justify-center">
            <svg className="w-7 h-7 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="font-mono text-xs text-muted tracking-widest">SELECCIONA UN CHAT</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-cream">
        <div className="w-6 h-6 border-4 border-ink border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-cream overflow-hidden min-h-0">
      {/* Header */}
      <div className="px-4 py-3 border-b-2 border-ink bg-paper flex items-center gap-3 shrink-0">
        {/* Back button — visible solo en móvil */}
        {onBack && (
          <button
            onClick={onBack}
            className="sm:hidden mr-1 w-8 h-8 flex items-center justify-center border-2 border-ink
                       hover:bg-ink hover:text-paper transition-colors"
            aria-label="Volver"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div className="w-8 h-8 bg-ink text-paper flex items-center justify-center font-display text-lg shrink-0">
          {otherUser?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <p className="font-body text-sm font-semibold truncate">{otherUser?.name || 'Usuario'}</p>
          <p className="font-mono text-xs text-muted truncate">{otherUser?.university}</p>
        </div>
        {isTyping && (
          <span className="ml-auto font-mono text-xs text-muted italic animate-pulse shrink-0">
            escribiendo...
          </span>
        )}
      </div>

      {/* Messages — scroll interno */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-center font-mono text-xs text-muted py-8">
            Inicia la conversación sobre el intercambio
          </p>
        )}
        {messages.map((msg, i) => {
          const isMe = (msg.sender?._id || msg.sender) === user._id;
          const showDate =
            i === 0 ||
            new Date(msg.createdAt).toDateString() !==
            new Date(messages[i - 1]?.createdAt).toDateString();

          return (
            <div key={msg._id || i}>
              {showDate && (
                <div className="text-center my-3">
                  <span className="font-mono text-xs text-muted bg-cream px-3 py-0.5 border border-ink/20">
                    {new Date(msg.createdAt).toLocaleDateString('es-CO', {
                      weekday: 'long', month: 'long', day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 border-2 font-body text-sm break-words
                                 ${isMe ? 'bg-ink text-paper border-ink' : 'bg-paper text-ink border-ink'}`}>
                  <p>{msg.text}</p>
                  <p className={`font-mono text-xs mt-1 ${isMe ? 'text-paper/50 text-right' : 'text-muted'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('es-CO', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 sm:px-4 py-3 border-t-2 border-ink bg-paper flex gap-2 sm:gap-3 shrink-0">
        <textarea
          ref={textareaRef}
          className="input-field resize-none flex-1 min-h-[40px] max-h-28 overflow-y-auto"
          rows={1}
          placeholder="Escribe... (Enter para enviar)"
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="btn-primary px-3 sm:px-4 self-end shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
