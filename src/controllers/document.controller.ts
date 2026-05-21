import { type Request, type Response } from 'express';

import { ERRORS } from '../translates';
import { type DocumentFileType } from './types';

const uploadDocuments = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const files = req.files as DocumentFileType[] | undefined;

    if (!files || files.length === 0) {
        res.status(400).json({
            success: false,
            error: ERRORS.NO_FILES_UPLOADED,
        });
        return;
    }

    const documents = files.map((file) => ({
        // multer/busboy decodes multipart `filename` as latin1 by default,
        // which mangles UTF-8 filenames (e.g. Cyrillic). Re-decode to UTF-8.
        name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
        link: file.location,
    }));

    res.json({
        success: true,
        documents,
    });
};

export const documentController = {
    uploadDocuments,
};
