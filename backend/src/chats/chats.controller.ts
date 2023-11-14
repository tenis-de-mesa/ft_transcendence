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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatsService } from './chats.service';
import { AuthenticatedGuard, ChannelRoleGuard } from '../auth/guards';
import { ChannelRoles, User } from '../core/decorators';
import { ChatEntity, ChatMemberRole, UserEntity } from '../core/entities';
import {
  CreateChatDto,
  ChatWithName,
  UpdateChatDto,
  ChangePasswordDto,
  JoinChannelDto,
  LeaveChannelDto,
  MuteMemberDto,
  UnmuteMemberDto,
  KickMemberDto,
} from './dto';

@UseGuards(AuthenticatedGuard, ChannelRoleGuard)
@Controller('chats')
export class ChatsController {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly chatsService: ChatsService,
  ) {}

  @Get()
  async findAll(@User() user: UserEntity): Promise<ChatWithName[]> {
    const chats = await this.chatsService.findAll(user);
    return this.chatsService.mapChatsToChatsWithName(chats, user);
  }

  @Get('all')
  async findAllChats(): Promise<ChatEntity[]> {
    return await this.chatsService.listAllChats();
  }

  @Get('with/:userId')
  async findWith(
    @Param('userId', ParseIntPipe) userId: number,
    @User() user: UserEntity,
  ): Promise<ChatEntity> {
    return await this.chatsService.findDirectChat(user, userId);
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

  @Post(':id/verify')
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('password') password: string,
  ): Promise<void> {
    await this.chatsService.verifyPassword(id, password);
  }

  @Post(':id/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ChannelRoles(ChatMemberRole.OWNER, ChatMemberRole.ADMIN)
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    return await this.chatsService.changePassword(id, dto);
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number): Promise<ChatEntity> {
    return await this.chatsService.findOne(id);
  }

  @Post(':id/join')
  async joinChat(
    @Param('id', ParseIntPipe) chatId: number,
    @User('id') userId: number,
    @Body() dto: JoinChannelDto,
  ): Promise<void> {
    return await this.chatsService.joinChat(chatId, userId, dto);
  }

  @Post(':id/leave')
  async leaveChat(
    @Param('id', ParseIntPipe) chatId: number,
    @User('id') userId: number,
    @Body() dto: LeaveChannelDto,
  ): Promise<void> {
    return await this.chatsService.leaveChat(chatId, userId, dto);
  }

  @Get(':id/role')
  async getMemberRole(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ): Promise<{ role: ChatMemberRole }> {
    const role = await this.chatsService.getMemberRole(id, userId);
    return { role };
  }

  @Post(':id/kick')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ChannelRoles(ChatMemberRole.OWNER, ChatMemberRole.ADMIN)
  async kickMember(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: KickMemberDto,
  ): Promise<void> {
    const { kickUserId } = dto;

    await this.chatsService.kickMember(id, userId, kickUserId);

    this.eventEmitter.emit('chat.kick', {
      kickUserId,
      chatId: id,
    });
  }

  @Post(':id/mute')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ChannelRoles(ChatMemberRole.OWNER, ChatMemberRole.ADMIN)
  async muteMember(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MuteMemberDto,
  ): Promise<void> {
    const { muteUserId, muteDuration } = dto;

    await this.chatsService.muteMember(id, userId, muteUserId);

    this.eventEmitter.emit('chat.mute', {
      userId,
      muteUserId,
      muteDuration,
      chatId: id,
    });
  }

  @Post(':id/unmute')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ChannelRoles(ChatMemberRole.OWNER, ChatMemberRole.ADMIN)
  async unmuteMember(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UnmuteMemberDto,
  ): Promise<void> {
    const { unmuteUserId } = dto;

    await this.chatsService.unmuteMember(id, userId, unmuteUserId);

    this.eventEmitter.emit('chat.unmute', {
      unmuteUserId,
      chatId: id,
    });
  }
}
