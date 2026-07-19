import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SocketContext } from './SocketContext';

export const OrderContext = createContext();

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) { /* audio not available */ }
};

export const OrderProvider = ({ children }) => {
  const { socket } = useContext(SocketContext);
  const [liveOrders, setLiveOrders] = useState([]);
  const [newOrderCount, setNewOrderCount] = useState(0);

  useEffect(() => {
    if (!socket) return;
    const handleNewOrder = (order) => {
      setLiveOrders(prev => [order, ...prev]);
      setNewOrderCount(prev => prev + 1);
      playNotificationSound();
    };
    const handleStatusUpdate = (order) => {
      setLiveOrders(prev => prev.map(o => o._id === order._id ? order : o));
    };
    socket.on('newOrder', handleNewOrder);
    socket.on('orderStatusUpdate', handleStatusUpdate);
    return () => { socket.off('newOrder', handleNewOrder); socket.off('orderStatusUpdate', handleStatusUpdate); };
  }, [socket]);

  const clearNotifications = useCallback(() => setNewOrderCount(0), []);

  return (
    <OrderContext.Provider value={{ liveOrders, newOrderCount, clearNotifications, playNotificationSound }}>
      {children}
    </OrderContext.Provider>
  );
};
