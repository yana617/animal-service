import { validationResult } from 'express-validator';

export const checkValidationErrors = async (req, res, next): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};
