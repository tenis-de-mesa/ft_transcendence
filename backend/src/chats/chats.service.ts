import * as argon2 from 'argon2';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  UserEntity,
  ChatEntity,
  MessageEntity,
  ChatMemberEntity,
  ChatMemberRole,
  ChatType,
  ChatAccess,
  ChatMemberStatus,
} from '../core/entities';
import {
  CreateChatDto,
  ChatWithName,
  CreateMessageDto,
  UpdateChatDto,
  ChangePasswordDto,
  JoinChannelDto,
  LeaveChannelDto,
  MuteMemberDto,
  KickMemberDto,
  UnmuteMemberDto,
  BanMemberDto,
  UnbanMemberDto,
  UpdateMemberRoleDto,
} from './dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,

    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,

    @InjectRepository(ChatMemberEntity)
    private readonly chatMemberRepository: Repository<ChatMemberEntity>,

    @InjectQueue('chats')
    private readonly chatsQueue: Queue,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateChatDto, creator: UserEntity): Promise<ChatEntity> {
    // Add creator user to the userIds
    const userIds = [...new Set([...dto.userIds, creator.id])];

    // Check if all users in userIds exist
    const users = await this.userRepository.findBy({ id: In(userIds) });
    if (users.length !== userIds.length) {
      throw new NotFoundException('One or more users not found');
    }

    switch (dto.type) {
      case ChatType.DIRECT:
        return await this.createDirectChat(dto, users, creator);

      case ChatType.CHANNEL:
        return await this.createChannelChat(dto, users, creator);

      default:
        throw new BadRequestException('Invalid chat type');
    }
  }

  private async createDirectChat(
    { message }: CreateChatDto,
    users: UserEntity[],
    creator: UserEntity,
  ): Promise<ChatEntity> {
    if (users.length > 2) {
      throw new BadRequestException('Direct chats can have at most 2 users');
    }

    const chat = await this.chatRepository.save({
      type: ChatType.DIRECT,
      access: ChatAccess.PRIVATE,
      messages: message ? [{ sender: creator, content: message }] : undefined,
    });

    users.map(async (user) => {
      await this.chatMemberRepository.save({ user, chat });
    });

    return chat;
  }

  private async createChannelChat(
    { password }: CreateChatDto,
    users: UserEntity[],
    creator: UserEntity,
  ): Promise<ChatEntity> {
    const chat = await this.chatRepository.save({
      owner: creator,
      type: ChatType.CHANNEL,
      access: password ? ChatAccess.PROTECTED : ChatAccess.PUBLIC,
      password: password ? await argon2.hash(password) : undefined,
    });

    users.map(async (user) => {
      if (user.id === creator.id) {
        return;
      }
      await this.chatMemberRepository.save({ user, chat });
    });

    await this.chatMemberRepository.save({
      chat,
      user: creator,
      role: ChatMemberRole.OWNER,
    });

    return chat;
  }

  async findOne(id: number): Promise<ChatEntity> {
    // TODO: filter all data user from only userid

    const chat = await this.chatRepository.findOne({
      where: {
        id,
      },
      relations: {
        users: { user: true },
        messages: { sender: true },
      },
      order: {
        messages: { createdAt: 'ASC' },
      },
      withDeleted: true,
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  /**
   * List all chats that the user is a member of, that is,
   * all channels and direct chats that the user is a non-banned
   * member of. The retrieved chats include the `ChatMember` relation,
   * and the `User` relation of the `ChatMember`s, including
   * soft-deleted users.
   *
   * @param userId The ID of the user
   * @returns All chats that the user is a member of
   */
  async findAll(userId: number): Promise<ChatEntity[]> {
    const query = this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.users', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .where('member.userId = :userId', { userId })
      .andWhere('member.status != :banned', { banned: ChatMemberStatus.BANNED })
      .withDeleted();

    return await query.getMany();
  }

  /**
   * List all channels accessible to the user, that is,
   * all public and protected channels that the user is
   * either a member of or can join, and is not banned from.
   * The retrieved channels include the `ChatMember` relation,
   * and the `User` relation of the `ChatMember`s, including
   * soft-deleted users.
   *
   * @param userId The ID of the user
   * @returns All channels accessible to the user
   */
  async listAllChats(userId: number): Promise<ChatEntity[]> {
    // Subquery that selects all chat ids that the user is banned from
    const subquery = this.chatMemberRepository
      .createQueryBuilder('sub')
      .select('sub.chatId')
      .where('sub.userId = :userId')
      .andWhere('sub.status = :banned');

    // The `.andWhere()` method is used to filter `chat.id`s
    // that were found in the subquery
    const query = this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.owner', 'owner')
      .leftJoinAndSelect('chat.users', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .where('chat.type = :type', { type: ChatType.CHANNEL })
      .andWhere(`chat.id NOT IN (${subquery.getQuery()})`)
      .setParameter('userId', userId)
      .setParameter('banned', ChatMemberStatus.BANNED)
      .withDeleted();

    return await query.getMany();
  }

  async update(id: number, dto: UpdateChatDto): Promise<void> {
    const chat = await this.findOne(id);

    const { password, access } = dto;

    chat.password = password ? await argon2.hash(password) : password;
    chat.access = access ?? chat.access;

    await this.chatRepository.save(chat);
  }

  async delete(id: number): Promise<void> {
    const chat = await this.findOne(id);

    await this.chatRepository.remove(chat);
  }

  async changePassword(id: number, dto: ChangePasswordDto): Promise<void> {
    const chat = await this.findOne(id);

    const { currentPassword, newPassword, confirmPassword } = dto;

    if (chat.type !== ChatType.CHANNEL) {
      throw new BadRequestException(
        'Non-channel chats cannot be password protected',
      );
    }

    if (chat.access === ChatAccess.PROTECTED) {
      if (!currentPassword) {
        throw new BadRequestException('Current password is required');
      }

      const isPasswordValid = await argon2.verify(
        chat.password,
        currentPassword,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid channel password');
      }
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    await this.chatRepository.update(id, {
      password: newPassword ? await argon2.hash(newPassword) : null,
      access: newPassword ? ChatAccess.PROTECTED : ChatAccess.PUBLIC,
    });
  }

  async verifyPassword(id: number, password: string): Promise<void> {
    const chat = await this.findOne(id);

    if (chat.type !== ChatType.CHANNEL) {
      throw new BadRequestException('Chat is not a channel');
    }
    if (chat.access !== ChatAccess.PROTECTED) {
      throw new BadRequestException('Channel is not password protected');
    }

    const isPasswordValid = await argon2.verify(chat.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid channel password');
    }
  }

  async getMember(chatId: number, userId: number): Promise<ChatMemberEntity> {
    const member = await this.chatMemberRepository.findOne({
      where: { userId, chatId },
      relations: { user: true },
    });

    if (!member) {
      throw new NotFoundException('Chat member not found');
    }

    return member;
  }

  async getMemberRole(chatId: number, userId: number): Promise<ChatMemberRole> {
    const member = await this.getMember(chatId, userId);

    return member.role;
  }

  async getMembers(chatId: number): Promise<ChatMemberEntity[]> {
    const query = this.chatMemberRepository
      .createQueryBuilder('member')
      .withDeleted()
      .leftJoinAndSelect('member.user', 'user')
      .where('member.chatId = :chatId', { chatId })
      .andWhere('member.status != :banned', { banned: ChatMemberStatus.BANNED })
      .andWhere('user.deletedAt IS NULL');

    return await query.getMany();
  }

  async getMembersByStatus(
    chatId: number,
    status: ChatMemberStatus,
  ): Promise<ChatMemberEntity[]> {
    const query = this.chatMemberRepository
      .createQueryBuilder('member')
      .withDeleted()
      .leftJoinAndSelect('member.user', 'user')
      .where('member.chatId = :chatId', { chatId })
      .andWhere('member.status = :status', { status })
      .andWhere('user.deletedAt IS NULL');

    return await query.getMany();
  }

  async findDirectChat(
    currentUser: UserEntity,
    otherUserId: number,
  ): Promise<ChatEntity> {
    const otherUser = await this.userRepository.findOneBy({
      id: otherUserId,
    });
    if (!otherUser) {
      throw new NotFoundException('User not found');
    }
    if (currentUser.id == otherUser.id) {
      const selfChat = await this.findSelfChat(currentUser);
      if (!selfChat) {
        throw new NotFoundException('Self chat not found');
      }
      return this.findOne(selfChat.id);
    }

    const userIds = [currentUser.id, otherUser.id];
    const directChat = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin('chat.users', 'member')
      .select('chat.id')
      .where('chat.type = :type', { type: ChatType.DIRECT })
      .andWhere('member.userId IN (:...userIds)', { userIds })
      .groupBy('chat.id')
      .having('COUNT(DISTINCT member.userId) = 2')
      .getOne();

    if (!directChat) {
      throw new NotFoundException('Direct chat not found');
    }
    // Return the chat with relations
    return this.findOne(directChat.id);
  }

  async findSelfChat(user: UserEntity): Promise<ChatEntity | null> {
    return await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin('chat.users', 'member')
      .select('chat.id')
      .where('chat.type = :type', { type: ChatType.DIRECT })
      .andWhere('member.userId = :id', { id: user.id })
      .groupBy('chat.id')
      .having('COUNT(member.userId) = 1')
      .getOne();
  }

  async joinChat(
    chatId: number,
    userId: number,
    { password }: JoinChannelDto,
  ): Promise<void> {
    const chat = await this.findOne(chatId);

    if (chat.type !== ChatType.CHANNEL) {
      throw new BadRequestException('Chat is not a channel');
    }

    if (chat.access === ChatAccess.PROTECTED) {
      if (!password) {
        throw new BadRequestException('Password is required');
      }

      const isPasswordValid = await argon2.verify(chat.password, password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid channel password');
      }
    }

    await this.chatMemberRepository.save({ userId, chatId });
  }

  async leaveChat(
    chatId: number,
    userId: number,
    { newOwnerId }: LeaveChannelDto,
  ): Promise<void> {
    const chat = await this.findOne(chatId);

    if (chat.type === ChatType.DIRECT) {
      throw new BadRequestException('Cannot leave direct chats');
    }

    const member = await this.getMember(chatId, userId);

    if (member.role === ChatMemberRole.OWNER) {
      const members = chat.users.filter((member) => !member.user.deletedAt);

      if (members.length === 1) {
        await this.chatRepository.remove(chat);
        return;
      }

      if (!newOwnerId) {
        throw new BadRequestException('A new owner must be nominated');
      }

      let newOwner = await this.getMember(chatId, newOwnerId);
      newOwner.role = ChatMemberRole.OWNER;
      newOwner = await this.chatMemberRepository.save(newOwner);

      this.eventEmitter.emit('chat.updateMemberRole', newOwner);
    }

    await this.chatMemberRepository.remove(member);
  }

  async addMessage(dto: CreateMessageDto): Promise<MessageEntity> {
    const findUserPromise = this.userRepository.findOne({
      relations: { blockedBy: true, blockedUsers: true },
      where: { id: dto.senderId },
    });
    const findChatPromise = this.chatRepository.findOne({
      relations: { users: true },
      where: { id: dto.chatId },
    });

    const [chat, user] = await Promise.all([findChatPromise, findUserPromise]);

    if (chat?.type == ChatType.DIRECT) {
      const blockedUsersList = user.blockedUsers.map(
        (block) => block.blockedUserId,
      );
      const blockedList = user.blockedBy.map((block) => block.blockedById);
      const membersList = chat.users.map((member) => member.userId);
      for (const member of membersList) {
        if (blockedList.includes(member)) {
          throw new HttpException('User blocked', HttpStatus.FORBIDDEN);
        }
        if (blockedUsersList.includes(member)) {
          throw new HttpException('User blocked', HttpStatus.FORBIDDEN);
        }
      }
    }

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!dto.content) {
      throw new BadRequestException('Message cannot be empty');
    }

    return this.messageRepository.save({
      chat,
      sender: user,
      content: dto.content,
    });
  }

  async kickMember(
    chatId: number,
    userId: number,
    dto: KickMemberDto,
  ): Promise<ChatMemberEntity> {
    const { kickUserId } = dto;

    const chat = await this.findOne(chatId);

    if (chat.type !== ChatType.CHANNEL) {
      throw new BadRequestException('Chat is not a channel');
    }

    const [_, kickMember] = await Promise.all([
      this.getMember(chatId, userId),
      this.getMember(chatId, kickUserId),
    ]);

    if (kickMember.role === ChatMemberRole.OWNER) {
      throw new BadRequestException('Owner cannot be kicked');
    }

    return await this.chatMemberRepository.remove(kickMember);
  }

  async muteMember(
    chatId: number,
    userId: number,
    dto: MuteMemberDto,
  ): Promise<ChatMemberEntity> {
    const { muteUserId, muteDuration } = dto;

    const chat = await this.findOne(chatId);

    if (chat.type !== ChatType.CHANNEL) {
      throw new BadRequestException('Chat is not a channel');
    }

    const [_, muteMember] = await Promise.all([
      this.getMember(chatId, userId),
      this.getMember(chatId, muteUserId),
    ]);

    if (muteMember.role === ChatMemberRole.OWNER) {
      throw new BadRequestException('Owner cannot be muted');
    }
    if (muteMember.status === ChatMemberStatus.MUTED) {
      throw new BadRequestException('User is already muted');
    }

    await this.chatsQueue.add(
      'unmute',
      { chatId, userId, unmuteUserId: muteUserId },
      { delay: muteDuration },
    );

    muteMember.status = ChatMemberStatus.MUTED;
    return await this.chatMemberRepository.save(muteMember);
  }

  async unmuteMember(
    chatId: number,
    userId: number,
    dto: UnmuteMemberDto,
  ): Promise<ChatMemberEntity> {
    const { unmuteUserId } = dto;

    const chat = await this.findOne(chatId);

    if (chat.type !== ChatType.CHANNEL) {
      throw new BadRequestException('Chat is not a channel');
    }

    const [_, unmuteMember] = await Promise.all([
      this.getMember(chatId, userId),
      this.getMember(chatId, unmuteUserId),
    ]);

    if (unmuteMember.role === ChatMemberRole.OWNER) {
      throw new BadRequestException('Owner is never muted');
    }
    if (unmuteMember.status === ChatMemberStatus.ACTIVE) {
      throw new BadRequestException('User is not muted');
    }

    unmuteMember.status = ChatMemberStatus.ACTIVE;
    return await this.chatMemberRepository.save(unmuteMember);
  }

  async banMember(
    chatId: number,
    userId: number,
    dto: BanMemberDto,
  ): Promise<ChatMemberEntity> {
    const { banUserId } = dto;

    const chat = await this.findOne(chatId);

    if (chat.type !== ChatType.CHANNEL) {
      throw new BadRequestException('Chat is not a channel');
    }

    const [_, banMember] = await Promise.all([
      this.getMember(chatId, userId),
      this.getMember(chatId, banUserId),
    ]);

    if (banMember.role === ChatMemberRole.OWNER) {
      throw new BadRequestException('Owner cannot be banned');
    }
    if (banMember.status === ChatMemberStatus.BANNED) {
      throw new BadRequestException('User is already banned');
    }

    banMember.status = ChatMemberStatus.BANNED;
    return await this.chatMemberRepository.save(banMember);
  }

  async unbanMember(
    chatId: number,
    userId: number,
    dto: UnbanMemberDto,
  ): Promise<ChatMemberEntity> {
    const { unbanUserId } = dto;

    const chat = await this.findOne(chatId);

    if (chat.type !== ChatType.CHANNEL) {
      throw new BadRequestException('Chat is not a channel');
    }

    const [_, unbanMember] = await Promise.all([
      this.getMember(chatId, userId),
      this.getMember(chatId, unbanUserId),
    ]);

    if (unbanMember.role === ChatMemberRole.OWNER) {
      throw new BadRequestException('Owner is never banned');
    }
    if (unbanMember.status === ChatMemberStatus.ACTIVE) {
      throw new BadRequestException('User is not banned');
    }

    unbanMember.status = ChatMemberStatus.ACTIVE;
    return await this.chatMemberRepository.save(unbanMember);
  }

  async updateMemberRole(
    chatId: number,
    userId: number,
    dto: UpdateMemberRoleDto,
  ): Promise<ChatMemberEntity> {
    const { updateUserId, role } = dto;

    const chat = await this.findOne(chatId);

    if (chat.type !== ChatType.CHANNEL) {
      throw new BadRequestException('Chat is not a channel');
    }

    const [member, updateMember] = await Promise.all([
      this.getMember(chatId, userId),
      this.getMember(chatId, updateUserId),
    ]);

    if (updateMember.role === ChatMemberRole.OWNER) {
      throw new BadRequestException('Owner cannot be updated');
    }

    if (role === ChatMemberRole.OWNER && member.role === ChatMemberRole.OWNER) {
      member.role = ChatMemberRole.ADMIN;

      const [_, oldOwner] = await Promise.all([
        this.chatRepository.update(chatId, { owner: updateMember.user }),
        this.chatMemberRepository.save(member),
      ]);

      this.eventEmitter.emit('chat.updateMemberRole', oldOwner);
    }

    updateMember.role = role;
    return await this.chatMemberRepository.save(updateMember);
  }

  mapChatsToChatsWithName(
    chats: ChatEntity[],
    currentUser: UserEntity,
  ): ChatWithName[] {
    return chats.map((chat) => ({
      ...chat,
      name: this.generateChatName(chat, currentUser),
    }));
  }

  private generateChatName(
    { users, type }: ChatEntity,
    currentUser: UserEntity,
  ): string {
    const members = users.map((member) => member.user);
    const otherMembers = members.filter(
      (member) => member.id !== currentUser.id,
    );

    // When a user creates a chat with himself
    if (otherMembers.length === 0) {
      return `${currentUser.nickname} (You)`;
    }

    // Direct chats only have two users, so no need to map nicknames
    if (type === ChatType.DIRECT) {
      const self = otherMembers[0];

      return self.deletedAt ? 'Deleted user' : self.nickname;
    }

    const nicknames: string[] = [`${currentUser.nickname} (You)`];

    otherMembers.forEach((member) => {
      if (!member.deletedAt) {
        nicknames.push(member.nickname);
      }
    });

    return this.joinChatNicknames(nicknames);
  }

  private joinChatNicknames(nicknames: string[]): string {
    if (nicknames.length === 0) {
      return '';
    } else if (nicknames.length === 1) {
      return nicknames[0];
    } else if (nicknames.length === 2) {
      return nicknames.join(' and ');
    } else {
      const last = nicknames.pop();
      return `${nicknames.join(', ')} and ${last}`;
    }
  }
}
