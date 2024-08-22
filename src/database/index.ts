import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { config } from './config';

const env = process.env.NODE_ENV ?? 'development';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const AppDataSource = new DataSource({
  ...config[env],
  type: 'postgres',
  synchronize: false,
  logging: false,
  entities: ['src/database/entities/*.entity{.ts,.js}'],
  migrations: ['src/migrations/**/*{.ts,.js}'],
  subscribers: ['src/subscribers/**/*{.ts,.js}'],
});
