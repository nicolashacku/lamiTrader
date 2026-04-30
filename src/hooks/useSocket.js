import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext.jsx';

// Singleton fuera del componente
let socketInstance = null;

export const useSocket = () => {
  const { user } = useAuth();
  // Devolvemos estado React para que los componentes re-rendericen
  // cuando el socket esté listo, en lugar de devolver null en el primer render
  const [socket, setSocket] = useState(socketInstance);

  useEffect(() => {
    if (!user) return;

    if (!socketInstance) {
      socketInstance = io('https://lamitraderbackend.onrender.com', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
      });
    }

    // Unirse a sala personal para notificaciones
    const onConnect = () => {
      socketInstance.emit('join_user_room', user._id);
    };

    if (socketInstance.connected) {
      socketInstance.emit('join_user_room', user._id);
    }

    socketInstance.on('connect', onConnect);
    setSocket(socketInstance);

    return () => {
      socketInstance.off('connect', onConnect);
    };
  }, [user]);

  return socket;
};
