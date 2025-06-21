import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 } from 'uuid';
import { type Request } from 'express';
import path from 'path';

import { ERRORS } from '../translates';

if (
    !process.env.AWS_REGION ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !process.env.AWS_BUCKET_NAME
) {
    throw new Error('AWS credentials not provided');
}

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const { AWS_BUCKET_NAME } = process.env;

export const upload = multer({
    limits: {
        fileSize: 1024 * 1024 * 10, // 10MB
        files: 15,
    },
    storage: multerS3({
        s3,
        bucket: AWS_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req: Request, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, `${req.params.id}/${v4()}${ext}`);
        },
    }),
    fileFilter: function (req, file, callback) {
        const ext = path.extname(file.originalname);
        if (
            ext !== '.png' &&
            ext !== '.jpg' &&
            ext !== '.gif' &&
            ext !== '.jpeg'
        ) {
            callback(new Error(ERRORS.ONLY_IMAGES_ALLOWED));
            return;
        }
        callback(null, true);
    },
});
