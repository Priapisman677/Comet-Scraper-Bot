import { Router } from 'express';
//*types:

import validateAndCatchErrors  from '../middleware.ts/validateAndCatchErrors.js';
import { scrapeAllProductsSchema } from '../zod-schemas/tracker-schemas.js';
import authMiddleware from '../middleware.ts/auth-middleware.js';
import { getAllPrices } from '../controllers/tracker/get-all-prices-controller.js';

const router = Router();

router.post(
	'/getAllPrices',
	validateAndCatchErrors (authMiddleware),
	validateAndCatchErrors (getAllPrices, scrapeAllProductsSchema)
);

export default router;
