import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { ERRORS } from '../translates';

export const deleteImageFromAWS = async (imageKey: string): Promise<any> => {
    if (
        !process.env.AWS_REGION ||
        !process.env.AWS_ACCESS_KEY_ID ||
        !process.env.AWS_SECRET_ACCESS_KEY ||
        !process.env.AWS_BUCKET_NAME
    ) {
        throw new Error(ERRORS.S3_SERVER_ERROR);
    }

    if (!imageKey) {
        throw new Error(ERRORS.S3_KEY_REQUIRED);
    }

    const s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: imageKey,
    });

    try {
        await s3.send(command);
    } catch (e) {
        throw new Error(ERRORS.S3_DELETE_ERROR);
    }
};
