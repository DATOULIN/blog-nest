import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterInfoDTO {
  @ApiProperty()
  @IsNotEmpty({ message: '用户名不能为空' })
  readonly username: string;
  // @ApiProperty()
  // @IsNotEmpty({ message: '真实姓名不能为空' })
  // @IsString({ message: '真实姓名必须是 String 类型' })
  // readonly nickname: string;
  @ApiProperty()
  @IsNotEmpty({ message: '密码不能为空' })
  readonly password: string;
  @ApiProperty()
  @IsNotEmpty({ message: '重复密码不能为空' })
  readonly repassword: string;
  @ApiProperty()
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsMobilePhone()
  @IsString()
  readonly phone: string;
  @ApiProperty()
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail()
  readonly email: string;
  @ApiProperty()
  @ApiPropertyOptional({
    description:
      '[用户角色]: 0-超级管理员 | 1-管理员 | 2-开发&测试&运营 | 3-普通用户（只能查看）',
  })
  readonly role?: number | string;
  @ApiProperty()
  readonly profile_photo?: string;
  @ApiProperty()
  readonly brief_introduction?: string;
}

export class LoginDTO {
  @ApiProperty()
  @IsNotEmpty({ message: '用户名不能为空' })
  readonly username: string;
  @ApiProperty()
  @IsNotEmpty({ message: '密码不能为空' })
  readonly password: string;
}

export class UpdateInfoDTO {
  @ApiProperty()
  @IsNotEmpty({ message: '用户名不能为空' })
  readonly username: string;
  @ApiProperty()
  @IsMobilePhone()
  readonly phone?: number;
  @ApiProperty()
  @IsEmail()
  readonly email?: string;
  @ApiProperty()
  readonly brief_introduction?: string;
}

export class resetPWInfoDTO {
  @ApiProperty()
  @IsNotEmpty({ message: '密码不能为空' })
  readonly password: string;
  @ApiProperty()
  @IsNotEmpty({ message: '重复密码不能为空' })
  readonly repassword: string;
}
