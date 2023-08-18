import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRequest } from './entities/friend_request.entity';
import { DeleteResult, Repository, Transaction } from 'typeorm';
import { User } from 'src/core/entities/user.entity';

// https://www.typescriptlang.org/docs/handbook/2/classes.html
// https://docs.nestjs.com/providers#services
// https://docs.nestjs.com/techniques/database

@Injectable()
export class FriendRequestService {
  @InjectRepository(FriendRequest)
  readonly friendRequestRepository: Repository<FriendRequest>;

  @InjectRepository(User)
  readonly userRepository: Repository<User>;

  async all(): Promise<FriendRequest[]> {
    return await this.friendRequestRepository.find();
  }

  async find(id: number) {
    return await this.friendRequestRepository.findOne({
      where: { id: id },
      relations: { sender: true, receiver: true },
    });
  }

  async save(sender_id: number, receiver_id: number): Promise<FriendRequest> {
    const sender = await this.userRepository.findOneBy({ id: sender_id });
    const receiver = await this.userRepository.findOneBy({ id: receiver_id });
    if (!sender) {
      throw new NotFoundException(`Sender not found`);
    }
    if (!receiver) {
      throw new NotFoundException(`Receiver not found`);
    }
    return await this.friendRequestRepository.save({
      sender: sender,
      receiver: receiver,
    });
  }

  async accept(id: number): Promise<void> {
    const friendRequest = await this.friendRequestRepository.findOne({
      where: { id: id },
      relations: { sender: { friends: true }, receiver: { friends: true } },
    });
    if (!friendRequest) {
      throw new NotFoundException(`Friend request with ID ${id} not found`);
    }
    friendRequest.sender.friends.push(friendRequest.receiver);
    friendRequest.receiver.friends.push(friendRequest.sender);
    await this.userRepository.save(friendRequest.sender);
    await this.userRepository.save(friendRequest.receiver);
    await this.friendRequestRepository.delete(id);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.friendRequestRepository.delete(id);
  }
}
