import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { AuthenticatedGuard, ChannelRoleGuard } from '../auth/guards';
import { ChannelRoles, User } from '../core/decorators';
import { ChatEntity, ChatMemberRole, UserEntity } from '../core/entities';
import { CreateChatDto, ChatWithName, UpdateChatDto } from './dto';

@UseGuards(AuthenticatedGuard, ChannelRoleGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  async findAll(@User() user: UserEntity): Promise<ChatWithName[]> {
    const chats = await this.chatsService.findAll(user);
    return this.chatsService.mapChatsToChatsWithName(chats, user);
  }

  @Post()
  async create(
    @Body() dto: CreateChatDto,
    @User() user: UserEntity,
  ): Promise<ChatEntity> {
    return await this.chatsService.create(dto, user);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ChannelRoles(ChatMemberRole.OWNER, ChatMemberRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChatDto,
  ): Promise<void> {
    return await this.chatsService.update(id, dto);
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number): Promise<ChatEntity> {
    return await this.chatsService.findOne(id);
  }
}
