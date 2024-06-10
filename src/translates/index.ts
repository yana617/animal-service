import { errors } from './errors';

const DEFAULT_LANGUAGE = 'EN';

const { LANG = DEFAULT_LANGUAGE } = process.env;

const existingLangs = {
  EN: 'EN',
  RU: 'RU',
};
const language = existingLangs[LANG] || DEFAULT_LANGUAGE;

export const ERRORS = errors[language];
