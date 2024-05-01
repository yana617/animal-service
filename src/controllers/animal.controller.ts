import { type Request, type Response } from 'express';

import { animalRepository } from '../repositories/animal.repository';

const getAll = async (req: Request, res: Response): Promise<void> => {
  const animals = await animalRepository.getAll();

  res.json({
    success: true,
    data: animals,
  });
};

const createAnimal = async (req: Request, res: Response): Promise<void> => {
  await animalRepository.create(req.body);

  res.json({
    success: true,
  });
};

export const animalController = {
  getAll,
  createAnimal,
};
