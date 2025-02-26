import { Page } from 'playwright';

export const scrapeResults = async (page: Page) => {
	//prettier-ignore
	const mainGrid = page.locator('.ui-search-layout__item');

	const count = await mainGrid.count();
	const newProductsArray = [];
	for(let i = 0; i < count; i++){
        //* It is important to try and catch. Sometimes the locator select something that is not a product and doesn't have a price.
        try{
            const title = await mainGrid.nth(i).locator('h3 a').textContent()
            const price = await mainGrid.nth(i).locator('span.andes-money-amount--cents-superscript span.andes-money-amount__fraction').textContent()
            const link = await mainGrid.nth(i).locator('h3 a').getAttribute('href')

            console.log({title, price});


            newProductsArray.push({title, price, link})
        }catch(e){

        }
    
    }

	return newProductsArray;
};
