import OpenAI from 'openai';
import { BadRequest, ErrorCode } from '../utils/exceptions.js';

/**
 * AI Model Selection (via OpenRouter):
 * OpenRouter provides access to various AI models, both free and paid. 
 * The following models have been tested, all of which are free at the time of benchmarking:
 * 
 * - 'google/gemini-2.0-pro-exp-02-05:free' 🥇✨ - Most critical & unbiased (default)
 * - 'nvidia/llama-3.1-nemotron-70b-instruct:free' - Best structured analysis
 * - 'google/gemini-2.0-flash-lite-preview-02-05:free' - Quick but slightly soft and biased
 * - 'google/gemini-2.0-flash-thinking-exp:free' - Well-balanced insights
 * - 'openchat/openchat-7b:free' - Too soft (avoid for this use case)
 *
 * The default model was chosen for its critical and unbiased responses.
 * OpenRouter offers additional models that may require payment credits if needed.
 * Consider switching models based on the desired response style or performance.
 */


// Initialize OpenAI instance with custom configurations
const Openai = new OpenAI({
	baseURL: process.env.BASE_URL, // Base URL for the API
	apiKey: process.env.OPEN_ROUTER_API_KEY, // API key for authentication
	defaultHeaders: {
		'HTTP-Referer': '<YOUR_SITE_URL>', // (Optional) Used for rankings on openrouter.ai
		'X-Title': '<YOUR_SITE_NAME>', // (Optional) Used for rankings on openrouter.ai
	},
});

/**
 * Sends a query to the AI model and returns the response.
 * @param query - The user's input message.
 * @returns The AI-generated response as a string.
 * @throws BadRequest if the AI response is invalid.
 */
export async function askAI(query: string) {

	// Send a request to the AI model
	const completion = await Openai.chat.completions.create({
		model: 'google/gemini-2.0-pro-exp-02-05:free', // Specifies the AI model
		messages: [
			{
				role: 'user',
				content: query
			},
		],
	});


	// Extract the AI's response
	const response = completion?.choices[0]?.message.content;

	// Handle cases where the AI response is missing or undefined
	if (!response) {
		console.log(completion); // Log full completion object for debugging
		throw new BadRequest('Error with AI, please try again', ErrorCode.AI_ERROR);
	}

	return response;
}
