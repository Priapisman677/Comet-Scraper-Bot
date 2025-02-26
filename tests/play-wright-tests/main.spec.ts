import { expect, test } from '@playwright/test';
import { scrapeAllProducts } from '../../src/scraper/mercado-libre/get-all-prices/scrape-all-products-main.js';
import getProductInfo from '../../src/scraper/mercado-libre/get-info-for-tracker.ts/get-product-info.js';
import { scrapeReviews } from '../../src/scraper/mercado-libre/scrapeReviews/scrape-reviews.js';
import { getDetails } from '../../src/scraper/mercado-libre/query-deatils/query-details.js';
import { describe } from 'node:test';

describe('MERCADO LIBRE', () => {
	test('scrapeAllProducts', async () => {
		//* There are two cases when looking at their results of ML. They depend on the name of the product you searchfor
		// const products1 = await scrapeAllProducts('dha');
		const products2 = await scrapeAllProducts('Graphics card');
		// expect(products1.length).toBeGreaterThan(0);
		expect(products2.length).toBeGreaterThan(0);
	});

	test('getProductInfo', async () => {
		const prodcutInfo = await getProductInfo(
			'https://articulo.mercadolibre.com.mx/MLM-3565293680-r0r-tarjeta-grafica-gt210-ddr2-de-64-bits-de-1-gb-pcie-20-_JM#polycard_client=search-nordic&position=29&search_layout=stack&type=item&tracking_id=34821ee4-fb14-4e81-b7e3-c8d63d16bfb5'
		);

		expect(prodcutInfo.title).toBeDefined();
	});

	test('scrapeReviews', async () => {
		const reviewsObject = await scrapeReviews(
			'https://www.mercadolibre.com.mx/playstation-5-slim-standard-1tb-bundle-con-2-juegos-fisicos/p/MLM36385726#polycard_client=search-nordic&searchVariation=MLM36385726&wid=MLM3261895018&position=3&search_layout=stack&type=product&tracking_id=666facc0-5e90-44a6-8781-5a2f6d05029b&sid=search'
		);

		expect(reviewsObject.reviews[0].comment).toBeDefined();
	});
	test('get-product-details', async () => {
		const productDetails = await getDetails(
			'https://www.mercadolibre.com.mx/playstation-5-slim-standard-1tb-bundle-con-2-juegos-fisicos/p/MLM36385726#polycard_client=search-nordic&searchVariation=MLM36385726&wid=MLM3261895018&position=3&search_layout=stack&type=product&tracking_id=666facc0-5e90-44a6-8781-5a2f6d05029b&sid=search'
		);

		expect(productDetails.title).toBeDefined();
	});

	//% All working - Feb-23-2025
});


describe('AMAZON', () => {
	
	

});
