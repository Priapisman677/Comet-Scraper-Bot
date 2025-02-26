import express from 'express';
import getPriceRouter from './routers/get-prices-router.js';
import addToCheckerRouter from './routers/tracker-router.js';
import  userRouter from './routers/users-router.js';
import  getReviewsRouter from './routers/reviews-router.js';
import  queryDetailsRouter from './routers/query-details-router.js';
import { errorMiddleware } from './middleware.ts/express-error-middleware.js';
import { startBot } from './telegram-bot/bot.js';
import { PrismaClient } from '@prisma/client';


const requiredEnvVars = [
    "HMAC_SECRT_KEY",
    "DATABASE_URL",
    "BASE_URL",
    "OPEN_ROUTER_API_KEY",
    "ENGLISH_SUMMARY_PROMPT",
    "SPANISH_SUMMARY_PROMPT",
    "ENGLISH_COMPARE_TWO_PROMPT",
    "SPAISH_COMPARE_TWO_PROMPT",
    "BOT_TOKEN"
];

const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
}




export const prisma = new PrismaClient();


//* Telegram bot
startBot()



const app = express();
app.use(express.json());
app.use(getPriceRouter);
app.use(addToCheckerRouter);
app.use(getReviewsRouter);
app.use(userRouter);
app.use(queryDetailsRouter);
app.use(errorMiddleware)




//* I exported the app here for both: 
// 1- testing vitest without running the server.
// 2- running the server.
export default app



