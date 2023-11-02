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
import {
  ChatEntity,
  ChatMemberEntity,
  ChatMemberRole,
  UserEntity,
} from '../core/entities';
import {
  CreateChatDto,
  ChatWithName,
  UpdateChatDto,
  ChangePasswordDto,
} from './dto';

@UseGuards(AuthenticatedGuard, ChannelRoleGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

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
    @User() user: UserEntity,
  ): Promise<ChatMemberEntity> {
    console.log(chatId);
    console.log(user);
    return await this.chatsService.joinChat(chatId, user);
  }

  @Get(':id/role')
  async getMemberRole(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ): Promise<{ role: ChatMemberRole }> {
    const role = await this.chatsService.getMemberRole(id, userId);
    return { role };
  }
}
