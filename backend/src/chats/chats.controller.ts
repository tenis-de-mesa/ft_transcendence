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
  ParseEnumPipe,
  Delete,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatsService } from './chats.service';
import {
  AuthenticatedGuard,
  ChannelMemberGuard,
  ChannelRoleGuard,
} from '../auth/guards';
import { ChannelRoles, User } from '../core/decorators';
import {
  ChatEntity,
  ChatMemberEntity,
  ChatMemberRole,
  ChatMemberStatus,
  UserEntity,
} from '../core/entities';
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
  BanMemberDto,
  UnbanMemberDto,
  UpdateMemberRoleDto,
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
    const chats = await this.chatsService.findAll(user.id);
    return this.chatsService.mapChatsToChatsWithName(chats, user);
  }

  @Get('all')
  async findAllChats(@User('id') userId: number): Promise<ChatEntity[]> {
    return await this.chatsService.listAllChats(userId);
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

  @Delete(':id/delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ChannelRoles(ChatMemberRole.OWNER)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.chatsService.delete(id);

    this.eventEmitter.emit('chat.delete', id);
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
  @UseGuards(ChannelMemberGuard)
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
  @UseGuards(ChannelMemberGuard)
  async leaveChat(
    @Param('id', ParseIntPipe) chatId: number,
    @User('id') userId: number,
    @Body() dto: LeaveChannelDto,
  ): Promise<void> {
    return await this.chatsService.leaveChat(chatId, userId, dto);
  }

  @Get(':id/role')
  @UseGuards(ChannelMemberGuard)
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

    await this.chatsService.kickMember(id, userId, dto);

    this.eventEmitter.emit('chat.kick', {
      userId: kickUserId,
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
    await this.chatsService.muteMember(id, userId, dto);

    this.eventEmitter.emit('chat.mute', {
      userId: dto.muteUserId,
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

    await this.chatsService.unmuteMember(id, userId, dto);

    this.eventEmitter.emit('chat.unmute', {
      userId: unmuteUserId,
      chatId: id,
    });
  }

  @Post(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ChannelRoles(ChatMemberRole.OWNER, ChatMemberRole.ADMIN)
  async banMember(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BanMemberDto,
  ): Promise<void> {
    const { banUserId } = dto;

    await this.chatsService.banMember(id, userId, dto);

    this.eventEmitter.emit('chat.ban', {
      userId: banUserId,
      chatId: id,
    });
  }

  @Post(':id/unban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ChannelRoles(ChatMemberRole.OWNER, ChatMemberRole.ADMIN)
  async unbanMember(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UnbanMemberDto,
  ): Promise<void> {
    const { unbanUserId } = dto;

    await this.chatsService.unbanMember(id, userId, dto);

    this.eventEmitter.emit('chat.unban', {
      userId: unbanUserId,
      chatId: id,
    });
  }

  @Post(':id/update-member-role')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ChannelRoles(ChatMemberRole.OWNER, ChatMemberRole.ADMIN)
  async updateMemberRole(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMemberRoleDto,
  ): Promise<void> {
    const member = await this.chatsService.updateMemberRole(id, userId, dto);

    this.eventEmitter.emit('chat.updateMemberRole', member);
  }

  @Get(':id/members')
  @UseGuards(ChannelMemberGuard)
  async getMembers(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ChatMemberEntity[]> {
    return await this.chatsService.getMembers(id);
  }

  @Get(':id/members/:status')
  @ChannelRoles(ChatMemberRole.OWNER, ChatMemberRole.ADMIN)
  async getMembersByStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('status', new ParseEnumPipe(ChatMemberStatus))
    status: ChatMemberStatus,
  ): Promise<ChatMemberEntity[]> {
    return await this.chatsService.getMembersByStatus(id, status);
  }
}
