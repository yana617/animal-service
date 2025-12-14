import {
    DeleteObjectCommand,
    GetObjectCommand,
    type GetObjectCommandInput,
    S3Client,
    S3ServiceException,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { ERRORS } from '../translates';

export class S3Service {
    private readonly s3Client: S3Client;

    constructor() {
        if (
            !process.env.AWS_REGION ||
            !process.env.AWS_ACCESS_KEY_ID ||
            !process.env.AWS_SECRET_ACCESS_KEY ||
            !process.env.AWS_BUCKET_NAME
        ) {
            throw new Error(ERRORS.S3_SERVER_ERROR);
        }

        this.s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }

    async getFileStream(key: string): Promise<Readable> {
        const params: GetObjectCommandInput = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        };

        try {
            const command = new GetObjectCommand(params);
            const response = await this.s3Client.send(command);

            if (response.Body instanceof Readable) {
                return response.Body;
            } else if (response.Body instanceof Uint8Array) {
                const readable = new Readable();
                readable.push(Buffer.from(response.Body));
                readable.push(null);
                return readable;
            } else if (typeof response.Body === 'string') {
                const readable = new Readable();
                readable.push(response.Body);
                readable.push(null);
                return readable;
            } else {
                throw new Error(
                    `Unsupported body type: ${typeof response.Body}`,
                );
            }
        } catch (error) {
            if (error instanceof S3ServiceException) {
                if (error.name === 'NoSuchKey') {
                    throw new Error(`File not found: ${key}`);
                }
                if (error.name === 'AccessDenied') {
                    throw new Error(`Access denied to file: ${key}`);
                }
            }
            throw error;
        }
    }

    async deleteByKey(imageKey: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageKey,
        });
        try {
            await this.s3Client.send(command);
        } catch (e) {
            throw new Error(ERRORS.S3_DELETE_ERROR);
        }
    }
}
