import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { UpdateSessionDto } from './dto';
import { SessionEntity } from '../core/entities';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
  ) {}

  async getSessionById(id: string): Promise<SessionEntity> {
    return await this.sessionRepository.findOneBy({ id });
  }

  async getSessionBySocketId(socketId: string): Promise<SessionEntity> {
    return await this.sessionRepository.findOne({
      where: { socketId: socketId },
      withDeleted: true,
    });
  }

  async updateSession(
    id: string,
    dto: UpdateSessionDto,
  ): Promise<UpdateResult> {
    return await this.sessionRepository.update(id, { ...dto });
  }
}
