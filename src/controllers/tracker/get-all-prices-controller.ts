//*types:
import { NextFunction, Request, Response } from "express";
import { scrapeAllProducts } from "../../scraper/mercado-libre/get-all-prices/scrape-all-products-main.js";


export const getAllPrices = async (req: Request<{}, {}, {productName: string}>, res: Response, _next: NextFunction) => {
        
        const data = await scrapeAllProducts(req.body.productName)

        res.send({data})
  

}