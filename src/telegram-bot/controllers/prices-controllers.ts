import axios from 'axios';
import { Readable } from 'node:stream';
import {
	AddOneToTrackerSchemaType,
	ScrapeAllProductsSchemaType,
} from '../../zod-schemas/tracker-schemas.js';
import { prisma } from '../../server-setup.js';

interface UpdateResponseItem {
	update: boolean;
	updateMessage: string;
	currentPrice: number;
	lastTimeTracked: number;
	productName: string;
	productDetailsId: number;
}

interface CheckForUpdatesResponse {
	data: UpdateResponseItem[];
}

interface Details { details: { title: string, id: number } }

type AxiosFunctionAuth = (ctx: any, token: string | null) => Promise<void>;

// Fetches all price data for a given product name and sends it as a JSON file
export const getAllPricesAPI: AxiosFunctionAuth = async (ctx, token) => {
	ctx.reply('Please wait...');
	const response: any = await axios.post(
		'http://127.0.0.1:3000/getAllPrices',
		{ productName: ctx.message.text } as ScrapeAllProductsSchemaType,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	const jsonString = JSON.stringify(response.data.data);
	console.log('🚀 ~ getAllPricesAPI ~ jsonString:', jsonString);

	// Convert the JSON string into a readable stream and send it as a document
	const stream = Readable.from(jsonString);
	ctx.replyWithDocument({ source: stream, filename: 'data.json ' });
};

// Adds a product to the tracking system
export const addOneToTrackerAPI: AxiosFunctionAuth = async (ctx, token) => {
	ctx.reply('Please wait...');
	const response: any = await axios.post(
		'http://127.0.0.1:3000/tracker/addOne',
		{ productUrl: ctx.message.text } as AddOneToTrackerSchemaType,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	// When we are already tracking the product it will be 200-OK response. So we will not be handled by the error middleware.
	// We can catch it here
	if (!response.data.data.addedTrackedProduct) {
		ctx.reply('You are already tracking this product');
		return;
	}

	// Confirm successful tracking
	ctx.reply(`✅ Added product with title "${response.data.data.product}"
		\n You can reference this product with the ID: ${response.data.data.addedTrackedProduct.productDetailsId}`);
};

// Deletes a specific tracked product by its ID
export const deleteFromTrackerAPI: AxiosFunctionAuth = async (ctx, token) => {
	ctx.reply('Please wait...');
	const response: any = await axios.delete(
		`http://127.0.0.1:3000/tracker/delete/${ctx.message.text}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	ctx.reply(
		`✅ Deleted product with ID ${response.data.data.deletedProductId}`
	);
};

// Deletes all tracked products
export const deleteAllFromTrackerAPI: AxiosFunctionAuth = async (ctx, token) => {
	ctx.reply('Please wait...');
	await axios.delete(
		`http://127.0.0.1:3000/tracker/deleteAll`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	ctx.reply(`✅ All products deleted`);
};

// Checks if tracked products have any updates
export const checkForUpdatesAPI: AxiosFunctionAuth = async (ctx, token) => {
	ctx.reply('Please wait...');
	let productsToCheck: [] | undefined;

	// If the user wants to check all products, send undefined (default to all)
	if (ctx.message.text === 'all' || ctx.message.text === 'All') {
		productsToCheck = undefined;
	} else {
		// Convert input into an array of numerical product IDs
		productsToCheck = ctx.message.text
			.split(',')
			.map((id: string) => Number(id.trim())) // Convert to number
			.filter((id: number) => !isNaN(id));  // Remove invalid numbers
	}

	const response = await axios.post<CheckForUpdatesResponse>(
		`http://127.0.0.1:3000/tracker/checkforupdates`,
		{ productDetailIds: productsToCheck },
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	// Filter the response to show only updated products
	const updates = response.data.data.filter((updateObject) => updateObject.update);

	if (updates.length === 0) {
		ctx.reply('✅ No updates found.');
	} else {
		ctx.reply(`⚡ ${updates.length} products have updates:\n\n` +
			updates.map(u => `📌 ${u.productName}: ${u.updateMessage}`).join('\n'));
	}
};

// Enables price alerts for the user
export const optInPriceAlerts: AxiosFunctionAuth = async (ctx) => {
	// Check if the user exists in the database
	const foundUser = await prisma.telegram_User.findUnique({
		where: {
			telegramId: ctx.from.id
		}
	});

	if (!foundUser) {
		ctx.reply('You need to create an account first');
		return;
	}

	// Check if price alerts are already enabled
	if (foundUser.priceAlerts) {
		ctx.reply('Price alerts are already on');
		return;
	}

	// Enable price alerts
	await prisma.telegram_User.update({
		where: {
			telegramId: ctx.from.id
		},
		data: {
			priceAlerts: true
		}
	});

	ctx.reply('Price alerts are now on. You will be notified when the price of a product changes every 1 minute.');
};

// Disables price alerts for the user
export const optOutPriceAlerts: AxiosFunctionAuth = async (ctx) => {
	// Check if the user exists in the database
	const foundUser = await prisma.telegram_User.findUnique({
		where: {
			telegramId: ctx.from.id
		}
	});

	if (!foundUser) {
		ctx.reply('You need to create an account first');
		return;
	}

	// Check if price alerts are already disabled
	if (!foundUser.priceAlerts) {
		ctx.reply('Price alerts are already off');
		return;
	}

	// Disable price alerts
	await prisma.telegram_User.update({
		where: {
			telegramId: ctx.from.id
		},
		data: {
			priceAlerts: false // Fix: should be false to turn off alerts
		}
	});

	ctx.reply('Price alerts are now off');
};

// Displays all tracked products with their IDs
export const displayProductsAPI: AxiosFunctionAuth = async (ctx, token) => {
	ctx.reply('Please wait...');
	const response = await axios.get(
		`http://127.0.0.1:3000/tracker/displayProductsIds`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	// Format the response into a user-friendly list
	const message = response.data.data
		.map((detailsObject: Details) => `✅ ${detailsObject.details.title}\nID: ${detailsObject.details.id}`)
		.join('\n\n');

	ctx.reply(message);
};
