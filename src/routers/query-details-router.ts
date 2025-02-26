import { Router } from 'express';
//*types:

import validateAndCatchErrors from '../middleware.ts/validateAndCatchErrors.js';
import authMiddleware from '../middleware.ts/auth-middleware.js';
import { compareTwoProductDetails, queryProductDetails } from '../controllers/reviews-details/query-details-controller.js';
import { compareTwoDetailsSchema, queryDetailsSchema } from '../zod-schemas/query-details-schema.js';

const router = Router();

router.post(
	'/details/query',
	validateAndCatchErrors(authMiddleware),
	validateAndCatchErrors(queryProductDetails, queryDetailsSchema)
);

router.post(
	'/details/compare',
	validateAndCatchErrors(authMiddleware),
	validateAndCatchErrors(compareTwoProductDetails, compareTwoDetailsSchema)
);


export default router;
