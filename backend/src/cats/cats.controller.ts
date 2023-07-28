// https://docs.nestjs.com/controllers

import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './cats.dto';
import { Cat } from './cat.entity';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Get()
  async index(): Promise<Cat[]> {
    return this.catsService.all();
  }

  @Get(':id')
  async show(@Param('id') id: number): Promise<Cat> {
    return this.catsService.find(id);
  }

  @Post()
  async create(@Body() cat: CreateCatDto) {
    this.catsService.save(cat);
  }

  @Delete(':id')
  async destroy(@Param('id') id: number): Promise<void> {
    this.catsService.delete(id);
  }  
}