import { chromium } from "playwright";
import { BadRequest, ErrorCode } from "../utils/exceptions.js";

export const launchBrowserAndPage = async (URL: string) => {
    // Launch a new Chromium browser instance (headless mode disabled for debugging)
    const browser = await chromium.launch({
        headless: true,
    });

    // Create a new browser context (isolated session)
    const context = await browser.newContext();
    
    // Open a new page (tab) in the browser
    const page = await context.newPage();
    
    try {
        // Navigate to the given URL and wait for the DOM content to load
        await page.goto(URL, { waitUntil: 'domcontentloaded' });
    } catch (e) {
        // Close the page in case of an error and throw a custom BadRequest exception
        await page.close();
        throw new BadRequest('Invalid product page', ErrorCode.INVALID_PRODUCT_PAGE);
    }

    return page; // Return the opened page instance
};
