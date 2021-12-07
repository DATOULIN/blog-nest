import { Injectable } from '@nestjs/common';
import { config } from '../../../config/config';
import { Upload } from '../../utils/upload';
import { sqlSelectFUNC, sqlFUNC } from '../../utils/sql';

@Injectable()
export class ArticleService {
  /**
   * 查询评论总数
   * */
  async getCommentTotal() {
    const commentCount = `
        SELECT COUNT(cm.id) total,cm.article_id 
        FROM comments cm 
        LEFT JOIN articles a 
        ON a.id = cm.article_id 
        group by article_id`;
    const commentCountList: any[] = await sqlSelectFUNC(commentCount);
    return commentCountList;
  }

  /**
   * 查询是否有该文章
   * id 文章id
   */
  async findOne(id: string): Promise<any | undefined> {
    const sql = `
      SELECT
        id, title, content
      FROM
        articles
      WHERE
        id = '${id}'
    `;
    try {
      const article = (await sqlSelectFUNC(sql))[0];
      return article;
    } catch (error) {
      console.error(error);
      return void 0;
    }
  }

  /**
   * 查询所有文章列表
   * pageIndex 第几条
   * pageSize 一页显示几条
   * keywords 搜索文章标题
   */
  async queryAllArticleList(query: any): Promise<any> {
    const { pageIndex = 1, pageSize = 10, keywords = '' } = query;
    // 分页查询条件
    const currentIndex =
      (pageIndex - 1) * pageSize < 0 ? 0 : (pageIndex - 1) * pageSize;
    const queryArticleListSQL = `
      SELECT
        a.id, a.title, a.content, a.like_count,
        a.views,a.cover_url,a.comment_count,
        u.username createBy,c.title categoryName,
        a.create_time,
        a.update_time
      FROM
        articles a
      LEFT JOIN users u 
      ON a.user_id = u.id
      LEFT JOIN category c 
      ON a.category_id = c.id
      WHERE
        a.title LIKE '%${keywords}%'
      ORDER BY
        a.create_time DESC
      LIMIT ${currentIndex}, ${pageSize}
    `;
    const articleList: any[] = await sqlSelectFUNC(queryArticleListSQL);
    // 统计数据条数
    const countArticleListSQL = `
      SELECT
        COUNT(*) AS total
      FROM
        articles
      WHERE
        title LIKE '%${keywords}%'
    `;
    // 统计评论总数并插入对应文章中
    const commentCount = await this.getCommentTotal();
    articleList.forEach((article) => {
      commentCount.forEach((comment) => {
        if (article.id === comment.article_id) {
          article.comment_count = comment.total;
        }
      });
    });
    const count: any = (await sqlSelectFUNC(countArticleListSQL))[0];
    return {
      code: 200,
      data: {
        articleList,
        total: count.total,
      },
    };
  }

  /**
   * 创建文章
   * title 标题
   * content 内容
   * userId 用户id
   * categoryId 分类id
   * file 文件
   */
  async createArticle(file, body: any): Promise<any> {
    const { title, content, userId, categoryId } = body;
    const [fileName, extName] = file.originalname.split('.');
    const file_name = `${userId}_${fileName}${new Date().getTime()}.${extName}`;
    const IMG_URL = `/public/images/articles/${file_name}`;
    Upload('images/articles', file_name, file); // 文件上传
    const createArticleSQL = `
      INSERT INTO articles
        (title, content, like_count, views, comment_count, cover_url,user_id,category_id,create_time)
      VALUES
        ('${title}', '${content}', 0, 0, 0, '${IMG_URL}','${userId}','${categoryId}','${config.nowDate}');
    `;

    await sqlFUNC(createArticleSQL);
    return {
      code: 200,
      msg: 'Success',
    };
  }

  /**
   * 更新文章
   * id 文章id
   * title 标题
   * content 内容
   * userId 用户id
   */
  async updateArticle(body: any): Promise<any> {
    const { id, title, content, userId } = body;
    const article = await this.findOne(id);
    if (!article) {
      return {
        code: 400,
        msg: '文章不存在',
      };
    }
    const updateArticleSQL = `
      UPDATE
        articles
      SET
        title = '${title}',
        content = '${content}',
        user_id = '${userId}',
        update_time = '${config.nowDate}'
      WHERE
        id = ${id}
    `;
    // const transaction = await sequelize.transaction();
    await sqlFUNC(updateArticleSQL);
    return {
      code: 200,
      msg: 'Success',
    };
  }

  /**
   * 删除文章
   * id 文章id
   */
  async deleteArticle(body: any): Promise<any> {
    const { id } = body;
    const article = await this.findOne(id);
    if (!article) {
      return {
        code: 400,
        msg: '文章不存在',
      };
    }
    const deleteArticleSQL = `
      DELETE FROM
        articles
      WHERE
        id = ${id}
    `;
    await sqlFUNC(deleteArticleSQL);
    return {
      code: 200,
      msg: 'Success',
    };
  }

  /**
   * 获取单条文章
   * id 文章id
   */
  async getArticleById(query: any): Promise<any> {
    const { id } = query;
    const article = await this.findOne(id);
    if (!article) {
      return {
        code: 400,
        msg: '文章不存在',
      };
    }
    const getArticleByIdSQL = `
      SELECT      
      u.username,u.profile_photo,a.id,a.title,a.content,a.cover_url,
      a.views,a.like_count,a.create_time,c.title categoryName
      FROM articles a 
      LEFT JOIN users u
      ON a.user_id = u.id 
      LEFT JOIN category c 
      ON a.category_id = c.id
      WHERE a.id=${id}
    `;
    const articleList: any[] = await sqlSelectFUNC(getArticleByIdSQL);
    // 先查询当前浏览量，再增加
    const viewsSQL = `SELECT views FROM articles WHERE id = ${id}`;
    const views = await sqlSelectFUNC(viewsSQL);
    const addViewsSQL = `
      UPDATE
        articles
      SET
        views=${views[0].views + 1}
      WHERE
        id = ${id}`;
    await sqlFUNC(addViewsSQL);
    return {
      code: 200,
      data: {
        articleList,
      },
    };
  }

  /**
   * 查询某个用户下的所有文章
   * userid 用户id
   * pageIndex 第几条
   * pageSize 一页显示几条
   * keywords 搜索文章标题
   * */
  async getArticleFromUser(query: any): Promise<any> {
    const { userId, pageIndex = 1, pageSize = 10, keywords = '' } = query;
    const currentIndex =
      (pageIndex - 1) * pageSize < 0 ? 0 : (pageIndex - 1) * pageSize;
    const getArticleFromUserSQL = `
      SELECT 
      u.username createBy,a.id,a.title,a.content,a.cover_url,a.views,a.like_count,a.comment_count,a.create_time,c.title categoryName
      FROM articles a LEFT JOIN users u
      ON a.user_id = u.id LEFT JOIN category c ON a.category_id = c.id
      WHERE a.user_id = ${userId}  
      ORDER BY
      a.create_time DESC
      LIMIT ${currentIndex}, ${pageSize}
    `;

    const articleList: any[] = await sqlSelectFUNC(getArticleFromUserSQL);

    // 统计数据条数
    const countArticleListSQL = `
      SELECT
        COUNT(*) AS total
      FROM articles a 
      LEFT JOIN users u
      ON a.user_id = u.id 
      WHERE a.user_id = ${userId}  
    `;
    const count: any = (await sqlSelectFUNC(countArticleListSQL))[0];
    // 统计评论总数并插入对应文章中
    const commentCount = await this.getCommentTotal();
    articleList.forEach((article) => {
      commentCount.forEach((comment) => {
        if (article.id === comment.article_id) {
          article.comment_count = comment.total;
        }
      });
    });
    return {
      code: 200,
      data: {
        articleList,
        total: count.total,
      },
    };
  }

  /**
   * 查询某个分类下的所有文章
   * */
  async queryAllArticleFromCategory(query: any): Promise<any> {
    const { categoryId, pageIndex = 1, pageSize = 10, keywords = '' } = query;
    const currentIndex =
      (pageIndex - 1) * pageSize < 0 ? 0 : (pageIndex - 1) * pageSize;

    const getArticleFromCategorySQL = `
      SELECT 
      a.id,a.title,a.content,a.cover_url,a.views,a.like_count,a.create_time,u.username createBy,a.comment_count
      FROM articles a LEFT JOIN category c
      ON a.category_id = c.id LEFT JOIN users u ON a.user_id = u.id
      WHERE a.category_id = ${categoryId}
      ORDER BY
      a.create_time DESC
      LIMIT ${currentIndex}, ${pageSize}
    `;

    const articleList: any[] = await sqlSelectFUNC(getArticleFromCategorySQL);

    // 统计数据条数
    const countArticleListSQL = `
      SELECT
        COUNT(*) AS total
      FROM articles a 
      LEFT JOIN category c
      ON a.category_id =  c.id
      WHERE a.category_id = ${categoryId}  
    `;
    const count: any = (await sqlSelectFUNC(countArticleListSQL))[0];
    // 统计评论总数并插入对应文章中
    const commentCount = await this.getCommentTotal();
    articleList.forEach((article) => {
      commentCount.forEach((comment) => {
        if (article.id === comment.article_id) {
          article.comment_count = comment.total;
        }
      });
    });
    return {
      code: 200,
      data: {
        articleList,
        total: count.total,
      },
    };
  }

  /**
   * 点赞
   * */
  async likeArticle(body: any) {
    const { userId, articleId } = body;
    const article = await this.findOne(articleId);
    if (!article) {
      return {
        code: 400,
        msg: '文章不存在',
      };
    }
    // 查询like表里是否有该用户和该文章，有的话点赞，没有的话取消点赞
    const findUserSQL = `
      SELECT user_id FROM likes WHERE user_id = ${userId} AND article_id = ${articleId}
    `;
    const isLikes = await sqlSelectFUNC(findUserSQL);
    if (isLikes.length === 0) {
      const addLikesSQL = `
        INSERT INTO likes
            (user_id,article_id,create_time)
        VALUES
            ('${userId}','${articleId}','${config.nowDate}')
      `;
      await sqlFUNC(addLikesSQL);
      const getLikesSQL = `
        SELECT like_count FROM articles WHERE id = ${articleId}
        `;
      const likeCount = await sqlSelectFUNC(getLikesSQL);
      const addLikeCountSQL = `
        UPDATE articles 
        SET like_count = ${likeCount[0].like_count + 1} 
        WHERE id = ${articleId}
        `;
      await sqlFUNC(addLikeCountSQL);
      return {
        code: 200,
        data: true,
        msg: '点赞成功',
      };
    } else {
      const getLikesSQL = `
        SELECT like_count FROM articles WHERE id = ${articleId}
        `;
      const likeCount = (await sqlSelectFUNC(getLikesSQL))[0].like_count;
      const addLikeCountSQL = `
        UPDATE articles 
        SET like_count = ${likeCount - 1}
        WHERE id = ${articleId}
        `;
      await sqlFUNC(addLikeCountSQL);
      const deleteLikeSQL = `
        DELETE FROM
            likes
        WHERE
            user_id = ${userId} AND article_id = ${articleId}
      `;
      await sqlFUNC(deleteLikeSQL);
      return {
        code: 200,
        data: false,
        msg: '取消点赞成功',
      };
    }
  }

  /**
   * 文章是否被点赞
   * */
  async isLike(query: any) {
    const { articleId, userId } = query;
    const isLikeSQL = `
      SELECT * FROM likes WHERE article_id = ${articleId} AND user_id = ${userId}
    `;
    const isLike = await sqlSelectFUNC(isLikeSQL);
    if (isLike.length === 0) {
      return {
        code: 200,
        data: false,
      };
    } else {
      return {
        code: 200,
        data: true,
      };
    }
  }
}
