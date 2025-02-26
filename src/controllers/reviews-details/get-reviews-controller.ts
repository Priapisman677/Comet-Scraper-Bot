
import { NextFunction, Request, Response } from 'express';
import { AskAboutReviewsSchemaType, CompareTwoProductsSchemaType, getReviewsSchemaType } from '../../zod-schemas/review-schemas.js';
import { scrapeReviews } from '../../scraper/mercado-libre/scrapeReviews/scrape-reviews.js';
import { askAI } from '../../scraper/askAI.js';
import { BadRequest } from '../../utils/exceptions.js';

/**
 * Fetch reviews for a given product URL.
 */
export const getReviews = async (
	req: Request<{}, {}, getReviewsSchemaType>,
	res: Response,
	_next: NextFunction
) => {
	const { productUrl } = req.body;

	const reviews = await scrapeReviews(productUrl);

	res.json({ reviews });
};

/**
 * Fetch reviews and generate a summary based on the specified language.
 */
export const getReviewsSummary = async (
	req: Request<{}, {}, getReviewsSchemaType>,
	res: Response,
	_next: NextFunction
) => {
	const { productUrl, language } = req.body;

	const reviews = await scrapeReviews(productUrl);

	// Select the appropriate prompt based on language
	let prompt;
	if (language === 'spanish') {
		prompt = process.env.SPANISH_SUMMARY_PROMPT!;
	} else if (language === 'english') {
		prompt = process.env.ENGLISH_SUMMARY_PROMPT!;
	}

	const query = `${prompt} \n ${JSON.stringify(reviews)}`;

	const response = await askAI(query);

	res.json({ response });
};

/**
 * Compare reviews of two products and generate a comparative summary.
 */
export const compareTwoProducts = async (
	req: Request<{}, {}, CompareTwoProductsSchemaType>,
	res: Response,
	_next: NextFunction
) => {
	const { productUrls, language } = req.body;

	// Select the appropriate prompt based on language
	let prompt;
	if (language === 'spanish') {
		prompt = process.env.SPANISH_SUMMARY_PROMPT!;
	} else if (language === 'english') {
		prompt = process.env.ENGLISH_SUMMARY_PROMPT!;
	}

	// Fetch reviews for both products. If a request fails, return an error message for that URL.
	const reviews = await Promise.all(
		productUrls.map(async (url) => {
			try {
				return await scrapeReviews(url);
			} catch (e) {
				if (e instanceof BadRequest) {
					return `Request failed: Product with URL ${url} encountered an error: ${e.message}`;
				}
			}
		})
	);

	// Check if any errors occurred during scraping
	const errors = reviews.filter((review) => typeof review === 'string');

	// If there are errors, return the first encountered error response
	if (errors.length > 0) {
		res.status(400).send(errors[0]);
		return;
	}

	const query = `${prompt} \n ${JSON.stringify(reviews)}`;

	const response = await askAI(query);

	console.log("🚀 ~ compareTwoProducts ~ reviews:", reviews);
	res.send(response);
};

/**
 * Process a user query regarding product reviews in the specified language.
 */
export const askAboutReviews = async (
	req: Request<{}, {}, AskAboutReviewsSchemaType>,
	res: Response,
	_next: NextFunction
) => {
	const { productUrl, language, query } = req.body;

	const reviews = await scrapeReviews(productUrl);

	const fullQuery = `I speak ${language}. ${query} \n ${JSON.stringify(reviews)}`;

	const response = await askAI(fullQuery);

	res.json({ response });
};
