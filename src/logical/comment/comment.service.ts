import { Injectable } from '@nestjs/common';
import * as Sequelize from 'sequelize'; // 引入 Sequelize 库
import sequelize from '../../database/sequelize';
import { config } from '../../../config/config'; // 引入 Sequelize 实例
import { ArticleService } from '../article/article.service';
import { sqlSelectFUNC, sqlFUNC } from '../../utils/sql';

@Injectable()
export class CommentService {
  /**
   * 查询是否有此评论
   * */

  /**
   * 新增评论
   * param
   * content 内容
   * userId 用户id
   * articleId 文章id
   * */
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
    await sqlFUNC(createCommentSQL);
    return {
      code: 200,
      msg: 'Success',
    };
  }

  /**
   * 回复
   * */
  async createReply(body) {
    const { content, userId, articleId, parentId } = body;
    const article = await new ArticleService().findOne(articleId);
    if (!article) {
      return {
        code: 400,
        msg: '文章不存在',
      };
    }
    const createReplySQL = `
      INSERT INTO comments
        (content, like_count,user_id,article_id,parent_comment_id,create_time)
      VALUES
        ('${content}', 0, '${userId}','${articleId}','${parentId}','${config.nowDate}');
    `;
    await sqlFUNC(createReplySQL);
    return {
      code: 200,
      msg: 'Success',
    };
  }

  /**
   * 查询评论回复列表
   * */
  async queryCommentList(query) {
    const { articleId, pageIndex, pageSize } = query;
    const currentIndex =
      (pageIndex - 1) * pageSize < 0 ? 0 : (pageIndex - 1) * pageSize;
    const queryCommentsListSQL = `
      SELECT c.id,c.content,c.article_id,c.like_count,
      c.parent_comment_id,c.create_time,u.username
      FROM comments c 
      LEFT JOIN users u 
      ON u.id = c.user_id 
      WHERE c.article_id = ${articleId}
      ORDER BY
      c.create_time DESC
    `;
    const commentsList: any[] = await sqlSelectFUNC(queryCommentsListSQL);
    commentsList.forEach((item) => {
      item.children = [];
    });
    // 将每个评论的对应回复数据合并
    commentsList.forEach((comment) => {
      commentsList.forEach((reply) => {
        if (comment.id === reply.parent_comment_id) {
          comment.children.push(reply);
        }
      });
    });
    const list = commentsList.filter((comment) => {
      return !comment.parent_comment_id;
    });
    // 统计数据条数
    const countCommentListSQL = `
      SELECT
        COUNT(*) AS total
      FROM comments WHERE article_id = ${articleId} AND parent_comment_id IS NULL
    `;
    const count: any = (await sqlSelectFUNC(countCommentListSQL))[0];
    return {
      code: 200,
      msg: 'Success',
      data: {
        list,
        total: count.total,
      },
    };
  }

  /**
   * 删除回复或者评论
   * */
  async deleteComment(body) {
    const { id } = body;
    const deleteCommentSQL = `
      DELETE FROM
        comments
      WHERE
        id = ${id} 
      OR 
        parent_comment_id = ${id}
    `;
    await sqlFUNC(deleteCommentSQL);
    return {
      code: 200,
      msg: 'Success',
    };
  }
}
