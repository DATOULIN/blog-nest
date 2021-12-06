import { Injectable } from '@nestjs/common';
import sequelize from '../../database/sequelize';
import * as Sequelize from 'sequelize';
import { config } from '../../../config/config';

@Injectable()
export class CategoryService {
  /**
   * 查询是否有该分类
   * */

  async findOne(id: string): Promise<any | undefined> {
    const sql = `
      SELECT
        id, title
      FROM
        category
      WHERE
        id = '${id}'
    `;
    try {
      const category = (
        await sequelize.query(sql, {
          type: Sequelize.QueryTypes.SELECT, // 查询方式
          raw: true, // 是否使用数组组装的方式展示结果
          logging: true, // 是否将 SQL 语句打印到控制台
        })
      )[0];
      return category;
    } catch (error) {
      console.error(error);
      return void 0;
    }
  }

  /**
   * 增加分类
   * */
  async createCategory(body: any): Promise<any> {
    const { title } = body;
    const createCategorySQL = `
      INSERT INTO  category
        (title,create_time)
      VALUES
        ('${title}', '${config.nowDate}');
    `;
    await sequelize.query(createCategorySQL, { logging: false });
    return {
      code: 200,
      msg: 'Success',
    };
  }

  /**
   * 查询所有的分类列表
   * */
  async queryAllCategoryList(query: any): Promise<any> {
    const { pageIndex = 1, pageSize = 10, keywords = '' } = query;
    const currentIndex =
      (pageIndex - 1) * pageSize < 0 ? 0 : (pageIndex - 1) * pageSize;
    const queryCategoryListSQL = `
      SELECT
        id,
        title,
        create_time,
        update_time
      FROM
        category
      WHERE
        title LIKE '%${keywords}%'
      ORDER BY
        id DESC
      LIMIT ${currentIndex}, ${pageSize}
    `;
    const categoryList: any[] = await sequelize.query(queryCategoryListSQL, {
      type: Sequelize.QueryTypes.SELECT,
      raw: true,
      logging: true,
    });
    // 统计数据条数
    const countCategoryListSQL = `
      SELECT
        COUNT(*) AS total
      FROM
        category
      WHERE
        title LIKE '%${keywords}%'
    `;
    const count: any = (
      await sequelize.query(countCategoryListSQL, {
        type: Sequelize.QueryTypes.SELECT,
        raw: true,
        logging: false,
      })
    )[0];
    return {
      code: 200,
      data: {
        categoryList,
        total: count.total,
      },
    };
  }

  /**
   * 删除分类
   * */
  async deleteCategoryById(body: any): Promise<any> {
    const { id } = body;
    const category = await this.findOne(id);
    if (!category) {
      return {
        code: 400,
        msg: '该分类不存在',
      };
    }
    const deleteCategorySQL = `
      DELETE FROM
        category
      WHERE
        id = ${id}
    `;
    await sequelize.query(deleteCategorySQL, { logging: false });
    return {
      code: 200,
      msg: 'Success',
    };
  }
}
