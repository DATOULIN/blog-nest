import {
  Body,
  Controller,
  Param,
  Post,
  Query,
  Get,
  UseGuards,
  Request,
  UsePipes,
  Delete,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { RbacGuard } from '../../guards/rbac.guard';
import { roleConstans as role } from '../auth/constants';
import { AuthGuard } from '@nestjs/passport';
import { CreateArticleDTO } from './atticle.dto';
import { ValidationPipe } from '../../pipe/validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('article') // 添加 接口标签 装饰器
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {
  }

  // 查询所有文章列表
  @UseGuards(new RbacGuard(role.HUMAN))
  @UseGuards(AuthGuard('jwt'))
  @Get('all-list')
  async queryColumnList(@Query() query: any) {
    return await this.articleService.queryAllArticleList(query);
  }

  // 新增文章
  @UseGuards(new RbacGuard(role.HUMAN)) // 权限
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe()) // 使用管道验证
  @Post('create')
  @UseInterceptors(FileInterceptor('file')) // file对应HTML表单的name属性
  async createArticle(@UploadedFile() file: Express.Multer.File, @Body() body: CreateArticleDTO) {
    return await this.articleService.createArticle(file, body);
  }

  // 更新文章
  @UseGuards(new RbacGuard(role.HUMAN)) // 权限
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe()) // 使用管道验证
  @Put('update')
  async updateArticle(@Body() body: CreateArticleDTO) {
    return await this.articleService.updateArticle(body);
  }

  // 删除文章
  @UseGuards(new RbacGuard(role.HUMAN))
  @UseGuards(AuthGuard('jwt'))
  @Delete('delete')
  async deleteArticle(@Body() body: any) {
    return await this.articleService.deleteArticle(body);
  }

  // 获取文章详情
  @UseGuards(new RbacGuard(role.HUMAN))
  @UseGuards(AuthGuard('jwt'))
  @Get('detail')
  async getArticleById(@Query() query: any) {
    return await this.articleService.getArticleById(query);
  }

  // 查询某个用户下的所有文章
  @UseGuards(new RbacGuard(role.HUMAN))
  @UseGuards(AuthGuard('jwt'))
  @Get('user-list')
  async getArticleFromUser(@Query() query: any) {
    return await this.articleService.getArticleFromUser(query);
  }

  // 查询某个分类下的所有文章
  @UseGuards(new RbacGuard(role.HUMAN))
  @UseGuards(AuthGuard('jwt'))
  @Get('category-list')
  async queryAllArticleFromCategory(@Query() query: any) {
    return await this.articleService.queryAllArticleFromCategory(query);
  }

  // 点赞
  @UseGuards(new RbacGuard(role.HUMAN))
  @UseGuards(AuthGuard('jwt'))
  @Post('like')
  async likeArticle(@Body() body: any) {
    return await this.articleService.likeArticle(body);
  }

  // 查询某个文章是否被某个用户点赞
  @UseGuards(new RbacGuard(role.HUMAN))
  @UseGuards(AuthGuard('jwt'))
  @Get('isLike')
  async isLike(@Query() query: any) {
    return await this.articleService.isLike(query);
  }
}
