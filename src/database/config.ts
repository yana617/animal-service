import dotenv from 'dotenv';

dotenv.config();

type Environment = 'development' | 'test' | 'production';

interface Config {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
};

const {
  POSTGRES_DB: database,
  POSTGRES_USERNAME: username,
  POSTGRES_PASSWORD: password,
  POSTGRES_HOST: host,
  POSTGRES_PORT: port,
} = process.env;

if (!host || !database || !username || !password || !port) {
  throw Error('No config provided');
}

const common = {
  username,
  password,
  port,
};

export const config: Record<Environment, Config> = {
  development: {
    ...common,
    database,
    host,
  },
  test: {
    ...common,
    database: 'test-db',
    host: 'localhost',
  },
  production: {
    ...common,
    database,
    host,
  },
};
