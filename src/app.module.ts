import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './logical/user/user.module';
import { AuthModule } from './logical/auth/auth.module';
import { UserController } from './logical/user/user.controller';
import { ArticleController } from './logical/article/article.controller';
import { ArticleModule } from './logical/article/article.module';
import { CategoryController } from './logical/category/category.controller';
import { CategoryModule } from './logical/category/category.module';
import { CommentController } from './logical/comment/comment.controller';
import { CommentModule } from './logical/comment/comment.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ArticleModule,
    CategoryModule,
    CommentModule,
  ],
  controllers: [
    AppController,
    UserController,
    ArticleController,
    CategoryController,
    CommentController,
  ],
  providers: [AppService],
})
export class AppModule {}
