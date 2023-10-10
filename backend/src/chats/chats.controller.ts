import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { AuthenticatedGuard } from '../auth/guards';
import { User } from '../core/decorators';
import { UserEntity } from '../core/entities';
import { CreateChatDto, ChatWithName } from './dto';

@UseGuards(AuthenticatedGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  async findAll(@User() user: UserEntity): Promise<ChatWithName[]> {
    const chats = await this.chatsService.findAll(user);
    return this.chatsService.mapChatsToChatsWithName(chats, user);
  }

  @Post()
  async create(@Body() dto: CreateChatDto, @User() user: UserEntity) {
    dto.userIds.push(user.id);
    return await this.chatsService.create(dto);
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number) {
    return await this.chatsService.findOne(id);
  }
}
