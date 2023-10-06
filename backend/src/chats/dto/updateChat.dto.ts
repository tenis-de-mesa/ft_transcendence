import { PartialType } from '@nestjs/swagger';
import { CreateChatDto } from '.';

export class UpdateChatDto extends PartialType(CreateChatDto) {}
