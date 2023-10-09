import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { UpdateSessionDto } from './dto';
import { Session } from '../../core/entities';
import { Socket } from 'socket.io';
import { getSessionIdFromSocket } from '../../core/utils';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async getSessionById(id: string): Promise<Session> {
    return await this.sessionRepository.findOneBy({ id });
  }

  async getSessionBySocketId(socketId: string): Promise<Session> {
    return await this.sessionRepository.findOne({
      where: { socketId: socketId },
      withDeleted: true,
    });
  }

  async getSessionByClientSocket(client: Socket): Promise<Session> {
    const sessionId = getSessionIdFromSocket(client);
    return await this.getSessionById(sessionId);
  }

  async updateSession(
    id: string,
    dto: UpdateSessionDto,
  ): Promise<UpdateResult> {
    return await this.sessionRepository.update(id, { ...dto });
  }
}
