import { BadRequest, ErrorCode } from '../../../utils/exceptions.js';
import { launchBrowserAndPage } from '../../create-page.js';

export const getDetails = async (url: string) => {
    // Launch a new browser page for the given URL
    const page = await launchBrowserAndPage(url);

    try {
        // Wait for a specific button to appear, ensuring the page is fully loaded
        await page.waitForSelector('span.andes-button__content', { timeout: 2000 });
    } catch (e) {
        await page.close();
        // Throw an error if the page is invalid or doesn't load properly
        throw new BadRequest('Invalid product page', ErrorCode.INVALID_PRODUCT_PAGE);
    }

    // Extract product description
    const description = await page.locator('.ui-pdp-description__content').textContent();

    // Locate the product features table rows
    const tableRows = await page.locator('.andes-table__body .andes-table__row');

    // Extract features from the table and store them as key-value pairs
    const featuresArray = await tableRows.evaluateAll(rows => {
        return rows.map(row => {
            const featureElement = row.querySelector('.andes-table__header__container');
            const valueElement = row.querySelector('.andes-table__column--value');

            return {
                feature: featureElement ? (featureElement as HTMLTableCellElement).innerText.trim() : '',
                value: valueElement ? (valueElement as HTMLTableCellElement).innerText.trim() : ''
            };
        });
    });

    // Extract product title and price
    const title = await page.locator('h1.ui-pdp-title').textContent();
    const price = await page.locator('span[style="font-size:36px"] .andes-money-amount__fraction').textContent() + ' mxn';

    // Compile extracted data into a structured object
    const data = {
        title,
        price,
        description,
        features: featuresArray
    };

    await page.close(); // Ensure the page is closed after scraping
    return data;
};
