import { Body, Controller, Get, Query, UseGuards, Post, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { RbacGuard } from '../../guards/rbac.guard';
import { roleConstans as role } from '../auth/constants';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('category') // 添加 接口标签 装饰器
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {
  }

  // 查询所有分类列表
  @UseGuards(new RbacGuard(role.HUMAN))
  @UseGuards(AuthGuard('jwt'))
  @Get('all-list')
  async queryCategoryList(@Query() query: any) {
    return await this.categoryService.queryAllCategoryList(query);
  }

  // 增加分类
  @UseGuards(new RbacGuard(role.HUMAN))
  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createCategory(@Body() body: any) {
    return await this.categoryService.createCategory(body);
  }

  // 删除分类
  @UseGuards(new RbacGuard(role.HUMAN))
  @UseGuards(AuthGuard('jwt'))
  @Delete('delete')
  async deleteCategoryById(@Body() body: any) {
    return await this.categoryService.deleteCategoryById(body);
  }
}
