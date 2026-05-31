import express from 'express';

import { apiErrorHandler } from './errors.js';
import { routes } from './routes/index.js';

export const router = express.Router();

router.use(routes);

router.use(apiErrorHandler);
