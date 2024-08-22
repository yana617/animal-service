import dotenv from 'dotenv';

dotenv.config();

type Environment = 'development' | 'test' | 'production';

type Config = {
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
    NODE_ENV,
} = process.env;

if (
    (NODE_ENV !== 'test' && (!database || !host)) ||
    !username ||
    !password ||
    !port
) {
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
        database: database as string,
        host: host as string,
    },
    test: {
        ...common,
        database: 'test-db',
        host: 'postgres',
    },
    production: {
        ...common,
        database: database as string,
        host: host as string,
    },
};
