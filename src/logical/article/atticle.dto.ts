import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDTO {
  @ApiProperty()
  @IsNotEmpty({ message: '标题不能为空' })
  readonly title: string;
  @ApiProperty()
  @IsNotEmpty({ message: '内容不能为空' })
  readonly content: string;
}
