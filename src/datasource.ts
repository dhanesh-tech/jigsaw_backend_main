import { DataSource } from 'typeorm';

import {
  SQL_DB_HOST,
  SQL_DB_NAME,
  SQL_DB_PASSWORD,
  SQL_DB_USER,
  SQL_DB_PORT,
} from './_jigsaw/envDefaults';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: SQL_DB_HOST,
  port: SQL_DB_PORT,
  username: SQL_DB_USER,
  password: SQL_DB_PASSWORD,
  database: SQL_DB_NAME,
  entities: [`dist/**/*.entity{ .ts,.js}`],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
