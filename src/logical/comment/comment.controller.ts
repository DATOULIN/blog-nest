import {
  Controller,
  Post,
  UseGuards,
  UsePipes,
  Body,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { RbacGuard } from '../../guards/rbac.guard';
import { roleConstans as role } from '../auth/constants';
import { AuthGuard } from '@nestjs/passport';
import { ValidationPipe } from '../../pipe/validation.pipe';
import { CreateCommentDTO } from './comment.dto';

@ApiTags('comment') // 添加 接口标签 装饰器
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // 新增评论
  @UseGuards(new RbacGuard(role.HUMAN)) // 权限
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe()) // 使用管道验证
  @Post('create')
  async createComment(@Body() body: CreateCommentDTO) {
    return await this.commentService.createComment(body);
  }

  //回复
  @UseGuards(new RbacGuard(role.HUMAN)) // 权限
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe()) // 使用管道验证
  @Post('reply')
  async createReply(@Body() body: CreateCommentDTO) {
    return await this.commentService.createReply(body);
  }

  // 查询评论列表
  @UseGuards(new RbacGuard(role.HUMAN)) // 权限
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe()) // 使用管道验证
  @Get('all-list')
  async queryCommentList(@Query() query) {
    return await this.commentService.queryCommentList(query);
  }

  // 删除评论
  @UseGuards(new RbacGuard(role.HUMAN)) // 权限
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe()) // 使用管道验证
  @Delete('delete')
  async deleteComment(@Body() body: any) {
    return await this.commentService.deleteComment(body);
  }
}
