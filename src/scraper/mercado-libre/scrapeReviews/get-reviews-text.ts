import { FrameLocator, Page } from 'playwright';
import { OtherCaughtException } from '../../../utils/exceptions.js';

/**
 * Extracts review comments from the page or iframe.
 * Works when there are fewer than 5 reviews.
 */
export const getReviewsText = async (iframeOrPage: FrameLocator | Page) => {
	const commentsArray = [];

	// Locate all comment elements
	//prettier-ignore
	const commentElements = iframeOrPage.getByTestId('comment-content-component');
	
	// Extract text content from each comment element
	for (let i = 0; i < (await commentElements.count()); i++) {
		const element = await commentElements.nth(i).textContent();
		commentsArray.push(element);
	}
	
	return commentsArray;
};

/**
 * Opens the review section and extracts reviews.
 * Uses `getReviewsText()` after ensuring the modal loads.
 */
export const openIframeNgetReviewsText = async (page: Page) => {
	try {
		// Wait for the reviews modal to load or attempt to click "Show more"
        //prettier-ignore
		await page.waitForFunction(
			() => {
				const areReviewsReady = document.querySelector('.andes-modal__scroll');
				if (areReviewsReady) return true;
				const button = document.querySelector('.show-more-click') as HTMLButtonElement;
				if (button) button.click();
				return false;
			},
			{ timeout: 8000 }
		);
	} catch (e) {
        await page.close();
		throw new OtherCaughtException('Reviews box was not openable in eight seconds');
	}

    // Locate the iframe containing reviews
    const iframeElement = page.frameLocator('#ui-pdp-iframe-reviews');
    if (!iframeElement) {
        await page.close();
		throw new OtherCaughtException('IFrame not found');
	}

    // ----------------------------- SCROLLING TO LOAD REVIEWS -------------------------
	await iframeElement.locator('html').click(); // Focus inside the iframe

	let previousCount = await iframeElement
		.getByTestId('comment-content-component')
		.count();
	let maxAttempts = 5; // Maximum retries if no new comments load
	let attempts = 0;

	while (attempts < maxAttempts) {
		await page.mouse.wheel(0, 10000); 
		await page.mouse.wheel(0, 10000); 
		await page.waitForTimeout(1000); // Allow time for comments to load

        // Check if new comments loaded
        //prettier-ignore
		const newCount = await iframeElement.getByTestId('comment-content-component').count();

		if (newCount === previousCount) {
			attempts++; // No new comments, increment retry count
		} else {
			previousCount = newCount;
			attempts = 0; // Reset attempts if new comments appear
		}
	}

	console.log(`Stopped scrolling after loading ${previousCount} comments.`);
    // ----------------------------- SCROLLING TO LOAD REVIEWS -------------------------

	return await getReviewsText(iframeElement);
};
