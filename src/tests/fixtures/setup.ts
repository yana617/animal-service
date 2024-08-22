import dotenv from 'dotenv';

import { AppDataSource } from '../../database';
import { createApp } from '../../../app';

jest.setTimeout(10000);

dotenv.config();

export const app = createApp();

async function initDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
  } catch (error) {
    console.error('Unable to initialize database:', error);
  }
}

beforeAll(async () => {
  await initDatabase();
});

afterAll(async () => {
  await AppDataSource.destroy();
});
