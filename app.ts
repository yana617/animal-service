import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import type { Express, Request, Response } from 'express';

import router from './src/routes';
import { AppDataSource } from './src/database';

dotenv.config();

export const createApp = async (): Promise<Express> => {
  await AppDataSource.initialize();

  const app: Express = express();

  app.use((req: Request, res: Response, next) => {
    req.headers.origin = req.headers.origin ?? req.headers.host;
    next();
  });

  const {
    UI_LOCAL_URL,
    UI_PROD_URL,
    LOCAL_TEST_URL,
    // DOCKER_AUTH_SERVICE_URL,
  } = process.env;

  const whitelist = [UI_LOCAL_URL, UI_PROD_URL, LOCAL_TEST_URL];
  const corsOptions = {
    origin: (origin: string | undefined, callback) => {
      if (whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200,
  };

  if (process.env.NODE_ENV === 'production') {
    app.use(cors(corsOptions));
  }
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(':method [:status] :url  :response-time ms'));
  }

  app.use('/static', express.static('img'));

  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));

  app.use(router);

  app.use((err, req: Request, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: err.message });
  });

  return app;
};
