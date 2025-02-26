import { Router } from 'express';
//prettier-ignore
import validateAndCatchErrors from '../middleware.ts/validateAndCatchErrors.js';
//prettier-ignore
//prettier-ignore
import {askAboutReviews, compareTwoProducts, getReviews,getReviewsSummary,} from '../controllers/reviews-details/get-reviews-controller.js';
import authMiddleware from '../middleware.ts/auth-middleware.js';
import { askAboutReviewsSchema, compareTwoProductsSchema, getReviewsSchema } from '../zod-schemas/review-schemas.js';

const router = Router();

router.post(
	'/reviews/all',
	validateAndCatchErrors(authMiddleware),
	validateAndCatchErrors(getReviews, getReviewsSchema)
);

router.post(
	'/resviews/summary',
	validateAndCatchErrors(authMiddleware),
	validateAndCatchErrors(getReviewsSummary, getReviewsSchema)
);

router.post(
	'/reviews/compare',
	validateAndCatchErrors(authMiddleware),
	validateAndCatchErrors(compareTwoProducts, compareTwoProductsSchema)
);

router.post(
	'/reviews/ask',
	validateAndCatchErrors(authMiddleware),
	validateAndCatchErrors(askAboutReviews, askAboutReviewsSchema)
);




export default router;
