import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { getApiUrl } from '../api/apiConfig';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated || !user) { if (socket) { socket.disconnect(); setSocket(null); } return; }
    const URL = getApiUrl();
    const newSocket = io(URL, { transports: ['websocket', 'polling'] });
    newSocket.on('connect', () => { setIsConnected(true); newSocket.emit('joinRestaurant', user._id); });
    newSocket.on('disconnect', () => setIsConnected(false));
    setSocket(newSocket);
    return () => { newSocket.disconnect(); };
  }, [isAuthenticated, user?._id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
