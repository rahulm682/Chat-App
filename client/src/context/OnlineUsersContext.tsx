import { createContext, useContext, useEffect } from "react";
import { getSocket } from "../socket/socket";
import { useDispatch, useSelector } from 'react-redux';
import { setOnlineUsers } from '../store/slices/onlineUsersSlice';
import type { RootState } from '../store/index';

const OnlineUsersContext = createContext<string[]>([]);

export const useOnlineUsers = () => useContext(OnlineUsersContext);

const OnlineUsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const onlineUsers = useSelector((state: RootState) => state.onlineUsers.onlineUsers);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    
    const handleOnlineUsers = (users: string[]) => {
      dispatch(setOnlineUsers(users));
    };
    
    socket.on('online-users', handleOnlineUsers);
    
    // Request current online users when socket connects
    socket.emit('get-online-users');
    
    return () => {
      socket.off('online-users', handleOnlineUsers);
    };
  }, [dispatch]);

  return (
    <OnlineUsersContext.Provider value={onlineUsers}>
      {children}
    </OnlineUsersContext.Provider>
  );
};

export default OnlineUsersProvider;
