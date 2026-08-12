require('dotenv').config({quiet: true});

const base = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'social_network',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  seederStorage: 'sequelize',
};

module.exports = {
  development: { ...base, logging: console.log },
  test: { ...base, database: `${base.database}_test`, logging: false },
  production: { ...base, logging: false },
};
