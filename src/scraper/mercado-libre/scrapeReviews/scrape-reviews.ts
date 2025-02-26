import { BadRequest, ErrorCode } from "../../../utils/exceptions.js";
import { launchBrowserAndPage } from "../../create-page.js";
import { getReviewsText, openIframeNgetReviewsText } from "./get-reviews-text.js";

interface ReviewsObject {
    productTitle: string;
    reviews: {
        id: number;
        comment: string;
    }[];
}

// Example of a structured review object:
// {
//     productTitle: 'Laptop 32GB',
//     reviews: [
//         { id: 1, comment: 'Good' },
//         { id: 2, comment: 'Good too ;)' }
//     ]
// }

/**
 * Scrapes product reviews from the given URL.
 * @param url - The product page URL.
 * @returns A structured object containing the product title and its reviews.
 */
export const scrapeReviews = async (url: string): Promise<ReviewsObject> => {
    const page = await launchBrowserAndPage(url);

    // Ensure it's a valid product page by checking for the title selector.
    try {
        await page.waitForSelector('h1.ui-pdp-title', { timeout: 5000 });
    } catch (e) {
        await page.close();
        throw new BadRequest('Invalid product page', ErrorCode.INVALID_PRODUCT_PAGE);
    }

    // Ensure the product has reviews.
    try {
        await page.waitForSelector('.ui-review-capability__header__title', { timeout: 2000 });
    } catch (e) {
        await page.close();
        throw new BadRequest('This product has no reviews', ErrorCode.INVALID_PRODUCT_PAGE);
    }

    // Determine the number of reviews.
    const reviewsAmount = await Promise.race([
        page.locator('.total-opinion').textContent().then((r) => r?.split(' ')[0]),
        page.locator('h3.ui-reviews-label').textContent().then(() => 0), // If this element exists, the product has no reviews.
    ]);

    /**
     * Fetches reviews based on the number of available reviews.
     */
    const getReviews = async () => {
        if (reviewsAmount === 0) {
            await page.close();
            throw new BadRequest('The target product has zero reviews', ErrorCode.PRODUCT_EXISTS_NO_REVIEWS);
        } else if (Number(reviewsAmount) <= 5) {
            return await getReviewsText(page);
        } else {
            return await openIframeNgetReviewsText(page);
        }
    };

    // Get the product title.
    const title = await page.locator('h1.ui-pdp-title').textContent();

    // Fetch the reviews.
    const allReviewsArray: (string | null)[] = await getReviews();

    // Format the reviews into a structured object.
    const formattedReviews = allReviewsArray
        .filter((r) => r !== null) // Remove null values.
        .map((r, index) => ({
            id: index + 1,
            comment: r.trim(), // Trim unnecessary spaces.
        }));

    await page.close();

    const reviewsObject: ReviewsObject = {
        productTitle: title ? title : 'NO TITLE PROVIDED',
        reviews: formattedReviews,
    };

    return reviewsObject;
};