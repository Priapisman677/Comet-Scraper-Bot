import { BadRequest, ErrorCode } from '../../../utils/exceptions.js';
import { launchBrowserAndPage } from '../../create-page.js';
import { scrapeResults } from './scrape-results.js';

export const scrapeAllProducts = async (productName: string) => {
	// Convert spaces to dashes for MercadoLibre search URL formatting
	const query = productName.replace(' ', '-');

	// Open a new browser page with the search URL
	const page = await launchBrowserAndPage(`https://listado.mercadolibre.com.mx/${query}`);

	// Uncomment if needed: Simulate manual search input instead of URL-based search
	// await page.locator('input.nav-search-input').click();
	// await page.locator('input.nav-search-input').fill(query);
	// await page.keyboard.press('Enter');
	// await page.waitForLoadState('domcontentloaded');

	try {
		let allProducts = [];
		let i = 0;

		// Limit pagination to 10 pages (adjustable)
		while (i < 10) {
			i++;

			// There are other type of result pages when you search for something unknown for example "mercadolibre.com.mx/lñkad-sdñlad"
    		// In that case ".ui-search-layout__item.shops__layout-item'" will not appear instead  "ui-search-layout ui-search-layout--grid" will appear.
			

			// Scrape product data based on detected grid type
			const singlePageProducts = await scrapeResults(page);
			allProducts.push(...singlePageProducts);

			// Navigate to the next page if the pagination button exists
			try {
				await page.waitForSelector('.andes-pagination__button.andes-pagination__button--next', { timeout: 5000 });		
			} catch (e) {
				break;
			}
			const nextButton = page.locator('.andes-pagination__button.andes-pagination__button--next');
			await nextButton.click();

			console.log(allProducts.length);
		}

		await page.close();
		console.log(allProducts.length);
		return allProducts;
	} catch (error) {
		await page.close();
		throw new BadRequest('Invalid product page', ErrorCode.INVALID_PRODUCT_PAGE);
	}
};
