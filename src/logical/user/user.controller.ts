import {
  Controller,
  Post,
  Body,
  UseGuards,
  UsePipes,
  Put,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ValidationPipe } from '../../pipe/validation.pipe';
import {
  RegisterInfoDTO,
  LoginDTO,
  UpdateInfoDTO,
  resetPWInfoDTO,
} from './user.dto'; // 引入 DTO
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth() // Swagger 的 JWT 验证
@ApiTags('user') // 添加 接口标签 装饰器
@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UserService,
  ) {
  }

  // JWT验证 - Step 1: 用户请求登录
  @UsePipes(new ValidationPipe()) // 使用管道验证
  @Post('login')
  async login(@Body() loginParmas: LoginDTO) {
    console.log('JWT验证 - Step 1: 用户请求登录');
    const authResult = await this.authService.validateUser(
      loginParmas.username,
      loginParmas.password,
    );
    switch (authResult.code) {
      case 1:
        return this.authService.certificate(authResult.user);
      case 2:
        return {
          code: 500,
          msg: `账号或密码不正确`,
        };
      default:
        return {
          code: 500,
          msg: `查无此人`,
        };
    }
  }

  // @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
  @UsePipes(new ValidationPipe()) // 使用管道验证
  @Post('register')
  async register(@Body() body: RegisterInfoDTO, @Request() request) {
    // 指定 DTO类型
    return await this.usersService.register(body, request);
  }

  // 修改用户信息
  @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
  @UsePipes(new ValidationPipe()) // 使用管道验证
  @Put('update')
  @UseInterceptors(FileInterceptor('file')) // file对应HTML表单的name属性
  async update(@UploadedFile() file: Express.Multer.File, @Body() body: UpdateInfoDTO) {
    return await this.usersService.update(file, body);
  }

  // 修改密码
  @UseGuards(AuthGuard('jwt')) // 使用 'JWT' 进行验证
  @UsePipes(new ValidationPipe()) // 使用管道验证
  @Put('resetPW')
  async resetPW(@Body() body: resetPWInfoDTO) {
    return await this.usersService.resetPW(body);
  }
}
