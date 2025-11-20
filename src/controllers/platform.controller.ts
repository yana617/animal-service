import { type Request, type Response } from 'express';

import { platformRepository } from '../repositories/platform.repository';
import { ERRORS } from '../translates';

const getAll = async (req: Request, res: Response): Promise<void> => {
    const platforms = await platformRepository.getAll();

    res.json({
        success: true,
        data: platforms,
    });
};

const getPlatform = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const platform = await platformRepository.getById(id);

    if (!platform) {
        res.status(404).json({
            success: false,
            error: ERRORS.PLATFORM_NOT_FOUND,
        });
        return;
    }

    res.json({
        success: true,
        data: platform,
    });
};

const createPlatform = async (req: Request, res: Response): Promise<void> => {
    const { name } = req.body;

    const platform = await platformRepository.create({ name });

    res.json({ success: true, data: platform });
};

const deletePlatform = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const platform = await platformRepository.getById(id);

    if (!platform) {
        res.status(404).json({
            success: false,
            error: ERRORS.PLATFORM_NOT_FOUND,
        });
        return;
    }

    await platformRepository.deleteById(id);

    res.json({ success: true });
};

export const platformController = {
    getAll,
    getPlatform,
    createPlatform,
    deletePlatform,
};
