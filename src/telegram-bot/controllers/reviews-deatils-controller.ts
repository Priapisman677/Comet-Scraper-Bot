import axios from "axios";
import { getReviewsSchemaType } from "../../zod-schemas/review-schemas.js";
import { CompareTwoDetailsSchemaType, QueryDetailsSchemaType } from "../../zod-schemas/query-details-schema.js";

// Type definition for authenticated Axios function
// Expects a context object (ctx) and an optional token
// Returns a Promise<void> indicating an async operation

type AxiosFunctionAuth = (ctx: any, token: string | null) => Promise<void>;

// Function to fetch a summarized review using an API call
export const getReviewsSumamryAPI: AxiosFunctionAuth = async (ctx, token) => {
	ctx.reply('Please wait...'); // Inform user about request processing
	const response = await axios.post(
		'http://127.0.0.1:3000/resviews/summary', // API endpoint
		{
			productUrl: ctx.message.text, // Extracts product URL from user message
			language: 'english',
		} as getReviewsSchemaType,
		{
			headers: {
				Authorization: `Bearer ${token}`, // Attaches authorization token
			},
		}
	);	

	ctx.reply(response.data.response); // Send the API response back to the user
};

// Function to query reviews based on user input
export const queryReviewsAPI: AxiosFunctionAuth = async (ctx, token) => {
	const [productUrl, ...queryWords] = ctx.message.text.split(' '); // Extracts product URL and query words
	const query = queryWords.join(' '); // Joins remaining words as the query

	ctx.reply(`Captured query: ${query} \n Please wait...`);

	const response = await axios.post(
		'http://127.0.0.1:3000/reviews/ask', // API endpoint for querying reviews
		{
			productUrl,
			query,
			language: 'english',
		} as QueryDetailsSchemaType,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
	);
	ctx.reply(response.data.response); // Send the API response back to the user
};

// Function to query product details based on a user query
export const queryDetailsAPI: AxiosFunctionAuth = async (ctx, token) => {
	const [productUrl, ...queryWords] = ctx.message.text.split(' '); // Extracts product URL and query
	const query = queryWords.join(' ');

	ctx.reply(`Captured query: ${query} \n Please wait...`);
	const response = await axios.post(
		'http://127.0.0.1:3000/details/query', // API endpoint for product details
		{
			query,
			productUrl,
			language: 'english',
		} as QueryDetailsSchemaType,
		{ 
            headers: {
                Authorization: `Bearer ${token}` // Adds authorization token
            } 
        }
	);
	ctx.reply(response.data.response); // Sends the API response back to the user
};

// Function to compare two products based on a query
export const compareProductsAPI: AxiosFunctionAuth = async (ctx, token) => {
	const [productUrl1, productUrl2, ...queryWords] = ctx.message.text.split(' '); // Extracts two product URLs and query words
	const query = queryWords.join(' ');

	ctx.reply(`Captured query: ${query} \n Please wait...`);
	const response = await axios.post(
		'http://127.0.0.1:3000/details/compare', // API endpoint for comparison
		{
			query,
			productUrls: [productUrl1, productUrl2],
			language: 'english',
		} as CompareTwoDetailsSchemaType,
		{ 
            headers: {
                Authorization: `Bearer ${token}` // Attaches authorization token
            } 
        }
	);
	ctx.reply(response.data.response); // Sends the API response back to the user
};
