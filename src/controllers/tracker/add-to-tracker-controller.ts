//* Import required types and dependencies
import { NextFunction, Request, Response } from 'express';
import getProductInfo from '../../scraper/mercado-libre/get-info-for-tracker.ts/get-product-info.js';
import {
	AddManyToTrackerSchemaType,
	AddOneToTrackerSchemaType,
} from '../../zod-schemas/tracker-schemas.js';
import { BadRequest } from '../../utils/exceptions.js';
import { prisma } from '../../server-setup.js';

interface productDetails {
	title: string;
	id: number;
	url: string;
	createdAt: Date;
	currentPrice: number;
}

//* Add a single product to the tracker
export const addOneToTracker = async (
	req: Request<{}, {}, AddOneToTrackerSchemaType>,
	res: Response,
	_next: NextFunction
) => {
	const { productUrl } = req.body;
	const userId = req.user.id;

	const result = await addProduct(productUrl, userId);

	res.send({ data: result });
};

//* Add multiple products to the tracker
export const addManyToTracker = async (
	req: Request<{}, {}, AddManyToTrackerSchemaType>,
	res: Response,
	_next: NextFunction
) => {
	const { productsUrl } = req.body;
	const userId = req.user.id;

	// Process each URL concurrently
	const result = await Promise.all(
		productsUrl.map(async (url) => await addProduct(url, userId))
	);

	res.send({ data: result });
};

//* ------------------ Main Function: Adds a product to the tracker ------------------

const addProduct = async (productUrl: string, userId: number) => {
	try {
		// Fetch product details via scraping
		const { price, title } = await getProductInfo(productUrl);

		// Check if the product already exists in the database (by title or URL)
		let productDetails: productDetails | null = await prisma.product_details.findFirst({
			where: {
				OR: [{ title }, { url: productUrl }], // Matches any existing record with the same title or URL
			},
		});

		// If product doesn't exist, create a new record
		if (!productDetails) {
			productDetails = await prisma.product_details.create({
				data: {
					url: productUrl,
					title,
					currentPrice: price,
				},
			});
		}

		// Ensure the same user is not tracking the product more than once
		const foundTrackedProduct = await prisma.tracked_products.findFirst({
			where: {
				productDetailsId: productDetails.id,
				trackedBy: userId,
			},
		});

		if (foundTrackedProduct) {
			return { message: 'You are already tracking this product', product: title };
		}

		// Add the product to the user's tracked list
		const addedTrackedProduct = await prisma.tracked_products.create({
			data: {
				newPrice: price,
				oldPrice: price,
				productDetailsId: productDetails.id,
				trackedBy: userId,
			},
		});

		return { message: 'Product added to tracker', product: title, addedTrackedProduct };
	} catch (error) {
		// Handle validation errors specifically
		if (error instanceof BadRequest) {
			return { message: error.message, product: productUrl, errorCode: error.errorCode };
		}
		// Handle other unexpected errors
		return { message: 'Failed to add product', product: productUrl, error };
	}
};
