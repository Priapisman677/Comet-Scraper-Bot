import { NextFunction, Request, Response } from 'express';
import { BadRequest, ErrorCode } from '../../utils/exceptions.js';
import { prisma } from '../../server-setup.js';
import { deleteFromTrackerSchema } from '../../zod-schemas/tracker-schemas.js';

/**
 * Deletes a specific tracked product for the authenticated user.
 */
export const deleteManyFromTracker = async (
	req: Request<{ id: number }>,
	res: Response,
	_next: NextFunction
) => {
	// Extract and validate product ID from request params
	let productDetailsId = Number(req.params.id);
	productDetailsId = deleteFromTrackerSchema.parse(productDetailsId);

	// Get the authenticated user's ID
	const userId = req.user.id;

	// Delete the specified tracked product for the user
	const deletedList = await prisma.tracked_products.deleteMany({
		where: {
			trackedBy: userId,
			productDetailsId: productDetailsId,
		},
	});

	// If no product was deleted, return an error
	if (deletedList.count === 0) {
		throw new BadRequest('No product found with that id', ErrorCode.PRODUCT_NOT_FOUND);
	}

	// Respond with the deleted product ID
	res.send({ data: { deletedProductId: productDetailsId } });
};

/**
 * Deletes all tracked products for the authenticated user.
 */
export const deleteAllFromTracker = async (
	req: Request,
	res: Response,
	_next: NextFunction
) => {
	// Get the authenticated user's ID
	const userId = req.user.id;

	// Delete all tracked products for the user
	const deletedList = await prisma.tracked_products.deleteMany({
		where: {
			trackedBy: userId,
		},
	});

	// If no products were deleted, return an error
	if (deletedList.count === 0) {
		throw new BadRequest(
			'No products were deleted because you are not tracking any products',
			ErrorCode.PRODUCT_NOT_FOUND
		);
	}

	// Respond with the count of deleted products
	res.send({ data: { count: deletedList.count } });
};
