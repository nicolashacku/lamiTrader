import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../hooks/useSocket.js';

export default function Chat({ conversationId }) {
  const { user } = useAuth();
  const socket = useSocket();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  const otherUser = conversation?.participants?.find(
    (p) => p._id !== user._id
  );

  // Load conversation
  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    api.get(`/conversations/${conversationId}`)
      .then(({ data }) => {
        setConversation(data);
        setMessages(data.messages || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [conversationId]);

  // Join socket room
  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit('join_conversation', conversationId);

    socket.on('receive_message', ({ conversationId: cid, message }) => {
      if (cid === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on('typing', ({ userId, isTyping: t }) => {
      if (userId !== user._id) setIsTyping(t);
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing');
    };
  }, [socket, conversationId, user._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!text.trim() || !socket) return;
    socket.emit('send_message', {
      conversationId,
      senderId: user._id,
      text: text.trim(),
    });
    setText('');
    // Optimistic message
    setMessages((prev) => [
      ...prev,
      { _id: Date.now(), sender: { _id: user._id }, text: text.trim(), createdAt: new Date() },
    ]);
  }, [text, socket, conversationId, user._id]);

  const handleTyping = (val) => {
    setText(val);
    if (!socket) return;
    socket.emit('typing', { conversationId, userId: user._id, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing', { conversationId, userId: user._id, isTyping: false });
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-cream border-2 border-ink border-l-0">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ink/20 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className="flex-1 flex items-center justify-center bg-cream border-2 border-ink border-l-0">
        <div className="w-6 h-6 border-4 border-ink border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-cream border-2 border-ink border-l-0 overflow-hidden">
      {/* Chat header */}
      <div className="px-4 py-3 border-b-2 border-ink bg-paper flex items-center gap-3">
        <div className="w-8 h-8 bg-ink text-paper flex items-center justify-center font-display text-lg">
          {otherUser?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="font-body font-semibold text-sm">{otherUser?.name || 'Usuario'}</p>
          <p className="font-mono text-xs text-muted">{otherUser?.university}</p>
        </div>
        {isTyping && (
          <span className="ml-auto font-mono text-xs text-muted italic animate-pulse">
            escribiendo...
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                    {new Date(msg.createdAt).toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              )}
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 border-2 font-body text-sm
                               ${isMe
                                 ? 'bg-ink text-paper border-ink'
                                 : 'bg-paper text-ink border-ink'
                               }`}
                >
                  <p>{msg.text}</p>
                  <p className={`font-mono text-xs mt-1 ${isMe ? 'text-paper/50 text-right' : 'text-muted'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t-2 border-ink bg-paper flex gap-3">
        <textarea
          className="input-field resize-none flex-1"
          rows={1}
          placeholder="Escribe un mensaje... (Enter para enviar)"
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="btn-primary px-4 self-end disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
