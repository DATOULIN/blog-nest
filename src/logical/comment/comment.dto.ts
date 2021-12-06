import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDTO {
  @ApiProperty()
  @IsNotEmpty({ message: '内容不能为空' })
  readonly content: string;
}
