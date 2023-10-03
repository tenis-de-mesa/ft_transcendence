import { PartialType } from '@nestjs/swagger';
import { CreateChatDto } from './CreateChatDto.dto';

export class UpdateChatDto extends PartialType(CreateChatDto) {}
