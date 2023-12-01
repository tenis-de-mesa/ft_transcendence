import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

export interface IGatewaySocketManager {
  getUserSockets(id: number): Socket[];
  pushUserSocket(id: number, socket: Socket): void;
  deleteUserSocket(id: number): void;
  getSockets(): Map<number, Socket[]>;
}

@Injectable()
export class GatewaySocketManager implements IGatewaySocketManager {
  private readonly sockets: Map<number, Socket[]> = new Map();

  getUserSockets(id: number) {
    return this.sockets.get(id);
  }

  pushUserSocket(userId: number, socket: Socket) {
    this.sockets.set(userId, [...(this.sockets.get(userId) || []), socket]);
  }

  deleteUserSocket(userId: number) {
    this.sockets.delete(userId);
  }

  getSockets(): Map<number, Socket[]> {
    return this.sockets;
  }
}
