import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import yaml from 'js-yaml';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';

import type { Express, Request, Response } from 'express';

import router from './src/routes';

dotenv.config();

const swaggerDocument = yaml.load(fs.readFileSync('./swagger.yaml'));

export const createApp = (): Express => {
    const app: Express = express();

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.use((req: Request, res: Response, next) => {
        req.headers.origin = req.headers.origin ?? req.headers.host;
        next();
    });

    const { DOCKER_ANIMAL_SERVICE_URL, UI_LOCAL_URL, UI_PROD_URL, PORT } =
        process.env;

    const whitelist = [UI_LOCAL_URL, UI_PROD_URL, DOCKER_ANIMAL_SERVICE_URL];
    if (process.env.NODE_ENV !== 'production') {
        const POSTMAN_URL = `localhost:${PORT}`;
        whitelist.push(POSTMAN_URL);
    }
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

    if (process.env.NODE_ENV !== 'test') {
        app.use(cors(corsOptions));
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
