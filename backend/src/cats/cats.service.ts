// https://docs.nestjs.com/providers#services

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCatDto } from './cats.dto';
import { Cat } from './cat.entity';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catsRepository: Repository<Cat>,
  ) {}

  async all(): Promise<Cat[]> {
    return this.catsRepository.find();
  }

  async find(id: number): Promise<Cat> {
    return this.catsRepository.findOneBy({ id });
  }

  async save(cat: CreateCatDto): Promise<Cat> {
    const createdCat = await this.catsRepository.save(cat);
    return createdCat;
  }

  async update(id: number, cat: CreateCatDto): Promise<Cat> {
    await this.catsRepository.update({ id }, cat);
    return this.find(id);
  }

  async delete(id: number): Promise<void> {
    try {
      await this.catsRepository.delete({ id });
    } catch (error) {
      console.error(error);
    }
  }
}
