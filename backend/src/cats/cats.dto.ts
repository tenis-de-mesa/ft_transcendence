// https://docs.nestjs.com/controllers#request-payloads
// https://docs.nestjs.com/techniques/validation#auto-validation

import { IsString, IsInt } from 'class-validator';

export class CreateCatDto {
    @IsString()
    name: string;

    @IsInt()
    age: number;

    breed: string;
}