// https://docs.nestjs.com/controllers

import { Controller, Get, Post, Patch, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
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
  async create(@Body() createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = await this.catsService.save(createCatDto);
    return createdCat;
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateCatDto: CreateCatDto): Promise<Cat> {
    const updatedCat = await this.catsService.update(id, updateCatDto);
    return updatedCat;
  }

  @Delete(':id')
  async destroy(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.catsService.delete(id);
  }
}
