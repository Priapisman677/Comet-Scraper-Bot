import axios from 'axios';
import chalk from 'chalk';
import { prisma } from '../server-setup.js';

type AxiosFunctionAuth = (ctx: any, token: string | null) => Promise<void>;

/**
 * Higher-order function that wraps an Axios-based function with error handling.
 * - Ensures authentication if required.
 * - Catches Axios errors and provides meaningful user feedback.
 * - Prevents unhandled promise rejections.
 *
 * @param func - The Axios function to execute (e.g., API calls like signUp, deleteAccount).
 * @param ctx - The Telegram context object for handling user interactions.
 * @param authentication - Boolean indicating whether authentication (token) is required.
 * @returns An async function that handles errors gracefully.
 */
export const axiosErrorHandler = (func: AxiosFunctionAuth, ctx: any, authentication: boolean) => {
    return async () => {
        try {
            let token: string;

            if (authentication) {
                // Retrieve Telegram user ID from the context
                const telegramId = ctx.from.id;

                // Find the user in the database to check authentication
                const storedTelegramUser = await prisma.telegram_User.findFirst({
                    where: { telegramId },
                });

                // If user is not authenticated, inform them and exit
                if (!storedTelegramUser) {
                    ctx.reply(`You're not authenticated, please /signup first.`);
                    return;
                }

                // Extract the stored token
                token = storedTelegramUser.token;

                // Execute the provided function with authentication
                await func(ctx, token);
                return;
            }

            // Execute the function without authentication if not required
            await func(ctx, null);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                // Handle structured API error responses
                if (error.response.data.error_message) {
                    ctx.reply(error.response.data.error_message);
                    return;
                }
                // Log unexpected error responses
                ctx.reply(error.response.data);
                console.log(chalk.red.inverse('UNCAUGHT ERROR ABOVE'));
                return;
            } else {
                // Handle unknown errors
                console.error('Unknown error:', error);
                console.log(chalk.red.inverse('UNCAUGHT ERROR ABOVE'));
                ctx.reply('Network or unknown error, please try again.');
            }
        }
    };
};