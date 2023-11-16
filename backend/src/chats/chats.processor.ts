import { Process, Processor } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bull';
import { ChatsService } from './chats.service';

@Processor('chats')
export class ChatsProcessor {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Process('unmute')
  async handleUnmute(job: Job) {
    const { chatId, userId, unmuteUserId } = job.data;

    try {
      await this.chatsService.unmuteMember(chatId, userId, { unmuteUserId });
    } catch (error) {
      /* TODO: Emit error event to gateway,
       * that should propagate the error to the client
       */
    }

    this.eventEmitter.emit('chat.unmute', {
      chatId,
      userId: unmuteUserId,
    });
  }
}
