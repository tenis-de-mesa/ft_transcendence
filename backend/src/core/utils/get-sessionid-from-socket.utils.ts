import { Socket } from 'socket.io';
import * as cookie from 'cookie';

export const getSessionIdFromSocket = (client: Socket) => {
  const cookies = cookie.parse(client.handshake.headers.cookie || '');

  const sessionCookie = cookies['connect.sid'];

  if (!sessionCookie) return '';

  const prefixIndex = sessionCookie.indexOf(':');
  const dotIndex = sessionCookie.indexOf('.');
  const sessionId = sessionCookie.substring(prefixIndex + 1, dotIndex);
  return sessionId;
};
