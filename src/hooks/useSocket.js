import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext.jsx';

let socketInstance = null;

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    if (!socketInstance) {
      socketInstance = io('http://localhost:4000', {
        transports: ['websocket'],
      });
    }

    socketRef.current = socketInstance;

    // Join personal room for notifications
    socketInstance.emit('join_user_room', user._id);

    return () => {
      // Don't disconnect on unmount — keep single instance
    };
  }, [user]);

  return socketRef.current;
};
