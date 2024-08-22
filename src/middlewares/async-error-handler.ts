import { type Request, type Response, type NextFunction } from 'express';

export const asyncErrorHandler =
    (fn: any) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> =>
        await Promise.resolve(fn(req, res, next)).catch(next);
