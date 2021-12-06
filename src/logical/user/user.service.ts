import { Injectable } from '@nestjs/common';
import * as Sequelize from 'sequelize'; // 引入 Sequelize 库
import sequelize from '../../database/sequelize'; // 引入 Sequelize 实例
import { makeSalt, encryptPassword } from '../../utils/cryptogram'; // 引入加密函数
import { config } from '../../../config/config';
import { Upload } from '../../utils/upload';

@Injectable()
export class UserService {
  /**
   * 查询是否有该用户
   * @param username 用户名
   */
  async findOne(username: string): Promise<any | undefined> {
    const sql = `
      SELECT
        id, username, role, password_salt, password
      FROM
        users
      WHERE
        username = '${username}'
    `;
    try {
      const user = (
        await sequelize.query(sql, {
          type: Sequelize.QueryTypes.SELECT, // 查询方式
          raw: true, // 是否使用数组组装的方式展示结果
          logging: true, // 是否将 SQL 语句打印到控制台
        })
      )[0];
      // 若查不到用户，则 user === undefined
      return user;
    } catch (error) {
      console.error(error);
      return void 0;
    }
  }

  /**
   * 注册
   * @param requestBody 请求体
   * @param request
   */
  async register(requestBody: any, request): Promise<any> {
    const {
      username,
      password,
      repassword,
      phone,
      email,
      brief_introduction,
    } = requestBody;
    if (password !== repassword) {
      return {
        code: 400,
        msg: '两次密码输入不一致',
      };
    }
    const user = await this.findOne(username);
    console.log(user);
    if (user) {
      return {
        code: 400,
        msg: '用户已存在',
      };
    }
    const salt = makeSalt(); // 制作密码盐
    const hashPwd = encryptPassword(password, salt); // 加密密码
    const registerSQL = `
      INSERT INTO users
        (username,ip, password, password_salt, phone, email,profile_photo,brief_introduction,user_status, role, create_time)
      VALUES
        ('${username}','${request.ip}', '${hashPwd}', '${salt}', '${phone}','${email}','${config.default_head}','${brief_introduction}', 1, 3,'${config.nowDate}')
    `;
    try {
      await sequelize.query(registerSQL, { logging: false });
      return {
        code: 200,
        msg: 'Success',
      };
    } catch (error) {
      return {
        code: 503,
        msg: `Service error: ${error}`,
      };
    }
  }

  /**
   *  修改用户信息
   * */
  async update(file, body: any): Promise<any> {
    const { username, userid, phone, email, brief_introduction } = body;
    const user = await this.findOne(username);
    if (!user) {
      return {
        code: 400,
        msg: '用户不存在',
      };
    }
    const [fileName, extName] = file.originalname.split('.');
    const file_name = `${userid}_${fileName}${new Date().getTime()}.${extName}`;
    const IMG_URL = `/public/images/heads/${file_name}`;
    Upload('images/heads', file_name, file); // 文件上传
    const updateUserInfoSQL = `
      UPDATE
        users
      SET
        username='${username}',
        phone = '${phone}',
        email = '${email}',
        profile_photo = '${IMG_URL}',
        brief_introduction = '${brief_introduction}',
        update_time = '${config.nowDate}'
      WHERE
        id = ${userid}
    `;
    await sequelize.query(updateUserInfoSQL, { logging: false });
    return {
      code: 200,
      msg: 'Success',
    };
  }

  /**
   * 修改密码
   * */
  async resetPW(body: any): Promise<any> {
    const { password, repassword, username, userid } = body;
    if (password !== repassword) {
      return {
        code: 400,
        msg: '两次密码输入不一致',
      };
    }
    const user = await this.findOne(username);
    if (!user) {
      return {
        code: 400,
        msg: '用户已存在',
      };
    }
    const salt = makeSalt(); // 制作密码盐
    const hashPwd = encryptPassword(password, salt); // 加密密码
    const resetPWUserInfoSQL = `
      UPDATE
        users
      SET
        password='${hashPwd}',
        password_salt='${salt}',
        update_time = '${config.nowDate}'
      WHERE
        id = ${userid}
    `;
    await sequelize.query(resetPWUserInfoSQL, { logging: false });
    return {
      code: 200,
      msg: 'Success',
    };
  }
}
