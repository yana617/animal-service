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

const SAFE_DOCUMENT_EXTENSIONS: string[] = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.txt',
    '.csv',
    '.rtf',
    '.odt',
    '.ods',
];

const SAFE_DOCUMENT_MIME_TYPES: string[] = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/csv',
    'application/rtf',
    'text/rtf',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
];

export const uploadDocuments = multer({
    limits: {
        fileSize: 1024 * 1024 * 10, // 10MB
        files: 15,
    },
    storage: multerS3({
        s3,
        bucket: AWS_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req: Request, file, cb) {
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `docs/${v4()}${ext}`);
        },
    }),
    fileFilter: function (req, file, callback) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (
            !SAFE_DOCUMENT_EXTENSIONS.includes(ext) ||
            !SAFE_DOCUMENT_MIME_TYPES.includes(file.mimetype)
        ) {
            callback(new Error(ERRORS.ONLY_SAFE_DOCUMENTS_ALLOWED));
            return;
        }
        callback(null, true);
    },
});
