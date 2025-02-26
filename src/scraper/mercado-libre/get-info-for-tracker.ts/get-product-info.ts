import { Page } from 'playwright';
import { launchBrowserAndPage } from '../../create-page.js';
import { BadRequest, ErrorCode } from '../../../utils/exceptions.js';

/**
 * Scrapes product price and title from a given product URL.
 * @param {string} prodcutUrl - The URL of the product page.
 * @param {Page} [testPage] - Optional Playwright Page instance for testing.
 * @returns {Promise<{ price: number; title: string }>} - Extracted product details.
 * @throws {BadRequest} - If the page is not a valid product page.
 */
const getProductInfo = async (
	prodcutUrl: string,
	testPage?: Page
): Promise<{ price: number; title: string }> => {
	
	// Use the provided test page or launch a new browser page.
	const page = testPage || (await launchBrowserAndPage(prodcutUrl));

	try {
		// Ensure the page has loaded by waiting for a key element.
		await page.waitForSelector('span.andes-button__content', {
			timeout: 10000,
		});
	} catch (e) {
		await page.close();
		throw new BadRequest(
			'This is not a valid product page',
			ErrorCode.INVALID_PRODUCT_PAGE
		);
	}

	//* Extract the correct price (ignoring discount prices).
	const unParsedPrice = await page
		.locator('span[style="font-size:36px"] .andes-money-amount__fraction')
		.textContent();
	const price = Number(unParsedPrice ?. replace(',', '').replace('$', ''));

	// Extract product title.
	const title = await page.locator('h1.ui-pdp-title').textContent();

	await page.close();

	// Validate extracted data.
	if (!price || !title) {
		throw new BadRequest(
			'This is not a valid product page',
			ErrorCode.INVALID_PRODUCT_PAGE
		);
	}
    
	return { price, title };
};

export default getProductInfo;
