/* eslint-disable @typescript-eslint/ban-types */
import { type Request, type Response } from 'express';

import { animalRepository } from '../repositories/animal.repository';
import { type GetAdsQuery } from './types';
import { platformRepository } from '../repositories/platform.repository';
import { ERRORS } from '../translates';

const getAdsForHomeless = async (
    req: Request<{}, {}, {}, GetAdsQuery>,
    res: Response,
): Promise<void> => {
    const { sortByPlatform, sortOrder = 'ASC' } = req.query;

    if (sortByPlatform) {
        const platform = await platformRepository.getById(sortByPlatform);

        if (!platform) {
            res.status(404).json({
                success: false,
                error: ERRORS.PLATFORM_NOT_FOUND,
            });
            return;
        }
    }

    const animalsByPlatformWithLastAdDate = await animalRepository.findAds();

    const animalsWithAdsByPlatforms = animalsByPlatformWithLastAdDate.reduce(
        (acc, row) => {
            const existingAnimal = acc.find(
                (item) => item.animal_id === row.animal_id,
            );

            if (existingAnimal) {
                existingAnimal.ads[row.platform_id] = row.last_ad_date;
            } else {
                acc.push({
                    animal_id: row.animal_id,
                    animal_name: row.animal_name,
                    ads: {
                        [row.platform_id]: row.last_ad_date,
                    },
                });
            }

            return acc;
        },
        [],
    );

    if (sortByPlatform) {
        animalsWithAdsByPlatforms.sort((a, b) => {
            const dateA = a.ads[sortByPlatform]
                ? new Date(a.ads[sortByPlatform])
                : new Date(0);
            const dateB = b.ads[sortByPlatform]
                ? new Date(b.ads[sortByPlatform])
                : new Date(0);

            if (sortOrder === 'ASC') {
                return dateA.getTime() - dateB.getTime();
            } else {
                return dateB.getTime() - dateA.getTime();
            }
        });
    }

    res.json({
        success: true,
        data: animalsWithAdsByPlatforms,
    });
};

export const adsController = {
    getAdsForHomeless,
};
