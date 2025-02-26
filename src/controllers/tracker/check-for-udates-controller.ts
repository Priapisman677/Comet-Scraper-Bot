import { NextFunction, Request, Response } from 'express';
import getProductInfo from '../../scraper/mercado-libre/get-info-for-tracker.ts/get-product-info.js';
import { BadRequest, ErrorCode, HttpException } from '../../utils/exceptions.js';
import { prisma } from '../../server-setup.js';
import { CheckForUpdatesSchemaSchemaType } from '../../zod-schemas/tracker-schemas.js';

/**
 * Handles checking for product price updates.
 * - If no product IDs are provided, it retrieves updates for all tracked products.
 * - Uses parallel promises to fetch price updates efficiently.
 */
export const checkForUpdates = async (
	req: Request<{}, {}, CheckForUpdatesSchemaSchemaType>,
	res: Response,
	_next: NextFunction
) => {
	let { productDetailIds } = req.body;
	const userId = req.user.id;

	// Retrieve all tracked products if no specific IDs are provided
	if (!productDetailIds) {
		const foundProductDetailsIds = await prisma.tracked_products.groupBy({
			by: ['productDetailsId'], // Group by product ID to avoid duplicates
			where: { trackedBy: userId },
		});
		// Convert the grouped results into an array of product IDs
		productDetailIds = foundProductDetailsIds.map((product) => product.productDetailsId);
	}

	if (!productDetailIds || productDetailIds.length === 0) {
		throw new BadRequest('You are not tracking products yet', ErrorCode.ALREADY_TRACKED);
	}

	const updatesArray: {}[] = [];

	// Fetch updates concurrently for all provided product IDs
	await Promise.all(
		productDetailIds.map(async (productId) => {
			try {
				// Retrieve the most recent tracking data for the product
				const foundTrackedProduct = await prisma.tracked_products.findMany({
					select: {
						details: true,
						newPrice: true,
					},
					where: {
						productDetailsId: productId,
						trackedBy: userId,
					},
					orderBy: { id: 'desc' }, // Ensure we get the most recent record
					take: 1,
				});

				if (foundTrackedProduct.length === 0) {
					updatesArray.push({ update: 'You are not tracking this product yet' });
					return;
				}

				const product = foundTrackedProduct[0];
				const url = product.details.url;

				// Scrape current product price
				const { price } = await getProductInfo(url);
				const priceDifference = price - product.newPrice;

				const updatesDetails = {
					currentPrice: price,
					lastTimeTracked: product.newPrice,
					productName: product.details.title,
					productDetailsId: product.details.id,
				};

				// Determine whether the price has changed and by how much
				if (product.newPrice === price) {
					updatesArray.push({ update: false, updateMessage: 'No price difference', ...updatesDetails });
				} else if (product.newPrice < price) {
					updatesArray.push({ update: true, updateMessage: `Product is up by 💸${priceDifference}$`, ...updatesDetails });
				} else {
					updatesArray.push({ update: true, updateMessage: `Product is down by 💸${priceDifference}$💸`, ...updatesDetails });
				}

				// Add a new tracking entry to keep a history of price changes
				await prisma.tracked_products.create({
					data: {
						productDetailsId: productId,
						trackedBy: userId,
						newPrice: price,
						oldPrice: product.newPrice,
					},
				});
			} catch (error) {
				if (error instanceof HttpException) {
					updatesArray.push({ update: false, updateMessage: error.message });
				}
			}
		})
	);

	res.send({ data: updatesArray });
};

/**
 * Retrieves all unique tracked product IDs for a user.
 * - Groups products to avoid duplicates.
 * - Fetches the most recent details for each product.
 */
export const displayTrackedProductsIds = async (req: Request, res: Response, _next: NextFunction) => {
	const userId = req.user.id;

	// Retrieve all unique product IDs tracked by the user
	const foundTrackedProducts = await prisma.tracked_products.groupBy({
		by: ['productDetailsId'],
		where: { trackedBy: userId },
	});

	if (foundTrackedProducts.length === 0) {
		throw new BadRequest('You are not tracking products yet', ErrorCode.ALREADY_TRACKED);
	}

	const productsIdsArray = foundTrackedProducts.map((product) => product.productDetailsId);
	const foundProducts = [];

	// Retrieve the most recent product details for each tracked product
	for (const id of productsIdsArray) {
		const product = await prisma.tracked_products.findFirst({
			select: {
				details: {
					select: { title: true, id: true },
				},
			},
			where: {
				trackedBy: userId,
				productDetailsId: id,
			},
			orderBy: { id: 'desc' },
		});
		if (product) {
			foundProducts.push(product);
		}
	}

	res.send({ data: foundProducts });
};
