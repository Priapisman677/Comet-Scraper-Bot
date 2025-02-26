import { NextFunction, Request, Response } from 'express';
import { askAI } from '../../scraper/askAI.js';
import { CompareTwoDetailsSchemaType, QueryDetailsSchemaType } from '../../zod-schemas/query-details-schema.js';
import { getDetails } from '../../scraper/mercado-libre/query-deatils/query-details.js';


/**
 * Handles a request to query product details and generate an AI response.
 * Expects a product URL, user query, and language from the request body.
 */
export const queryProductDetails = async (req: Request<{}, {}, QueryDetailsSchemaType>, res: Response, _next: NextFunction) => {
    const { productUrl, query, language } = req.body;
    
    // Fetch product details from the scraper
    const details = await getDetails(productUrl);

    // Construct the full query for AI processing
    const fullQuery = `I speak ${language}, ${query} ${JSON.stringify(details)}`;

    // Get AI-generated response
    const response = await askAI(fullQuery);

    res.send({ response });
};

/**
 * Handles a request to compare two products based on details and user query.
 * Expects an array of two product URLs, a query, and a language.
 */
export const compareTwoProductDetails = async (req: Request<{}, {}, CompareTwoDetailsSchemaType>, res: Response, _next: NextFunction) => {
    const { productUrls, query, language } = req.body;

    // Fetch details for both products concurrently
    const detailsArray = await Promise.all(
        productUrls.map(async (productUrl) => await getDetails(productUrl))
    );

    // Construct the full query for AI processing
    const fullQuery = `I speak ${language}, ${query} ${JSON.stringify(detailsArray)}`;

    // Get AI-generated response
    const response = await askAI(fullQuery);

    res.send({ response });
};
