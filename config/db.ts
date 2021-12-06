const productConfig = {
  mysql: {
    port: 3306,
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'test_blog',
    connectionLimit: 10,
  },
};

const localConfig = {
  mysql: {
    port: '3306',
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'test_blog',
    connectionLimit: 10,
  },
};

const config = process.env.NODE_ENV ? productConfig : localConfig;

export default config;
