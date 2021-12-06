import sequelize from '../database/sequelize'; // 引入 Sequelize 实例
import * as Sequelize from 'sequelize'; // 引入 Sequelize 库

export async function sqlSelectFUNC(sql) {
  const list: any[] = await sequelize.query(sql, {
    type: Sequelize.QueryTypes.SELECT,
    raw: true,
    logging: true,
  });
  return list;
}

export async function sqlFUNC(sql) {
  await sequelize.query(sql, { logging: false });
}
