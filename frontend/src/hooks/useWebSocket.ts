import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(url, {
      withCredentials: true,
      autoConnect: true,
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [url]);

  return socket;
};

export default useWebSocket;
