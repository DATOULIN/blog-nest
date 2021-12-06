import { Injectable } from '@nestjs/common';
import * as Sequelize from 'sequelize'; // 引入 Sequelize 库
import sequelize from '../../database/sequelize';
import { config } from '../../../config/config'; // 引入 Sequelize 实例
import { ArticleService } from '../article/article.service';

@Injectable()
export class CommentService {
  // constructor(private readonly articleService: ArticleService) {
  // }

  async createComment(body) {
    const { content, userId, articleId } = body;
    const article = await new ArticleService().findOne(articleId);
    if (!article) {
      return {
        code: 400,
        msg: '文章不存在',
      };
    }
    const createCommentSQL = `
      INSERT INTO comments
        (content, like_count,user_id,article_id,parent_comment_id,create_time)
      VALUES
        ('${content}', 0, '${userId}','${articleId}',null,'${config.nowDate}');
    `;
    await sequelize.query(createCommentSQL, { logging: false });
    return {
      code: 200,
      msg: 'Success',
    };
  }
}
