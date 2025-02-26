import { message } from 'telegraf/filters';

import bot from './bot-setup.js';


import { axiosErrorHandler } from './axois-error-handler.js';
import { prisma } from '../server-setup.js';
import { compareProductsAPI, getReviewsSumamryAPI, queryDetailsAPI, queryReviewsAPI } from './controllers/reviews-deatils-controller.js';
import { addOneToTrackerAPI, checkForUpdatesAPI, deleteAllFromTrackerAPI, deleteFromTrackerAPI, displayProductsAPI, getAllPricesAPI, optInPriceAlerts, optOutPriceAlerts } from './controllers/prices-controllers.js';
import { signUp, deleteAccountAPI } from './controllers/user-controllers.js';
import { startAlerts } from './price-alerts.js';

/**
 * Telegram Bot Integration with External API & Database Storage
 *
 * This bot interacts with an external API using **Axios** to send and receive data.
 * -  Axios simplifies HTTP requests, offers automatic JSON parsing, 
 *   and allows easy error handling with built-in retry mechanisms.
 * - **Why a Separate Prisma Model?** Telegram users are stored in a dedicated 
 *   Prisma model to:
 *   1. **Keep bot-specific data isolated** from other user data in the system.
 *   2. **Optimize queries for bot-related actions** (e.g., tracking Telegram IDs, 
 *      managing bot interactions without interfering with core user accounts).
 *   3. **Ensure flexibility** in handling Telegram-specific logic, such as 
 *      subscriptions, roles, or message history.
 * 
 * While this bot is deeply integrated with the backend API, it remains **decoupled** 
 * from core authentication, ensuring that Telegram users can interact without exposing 
 * sensitive internal systems.
 */


//* Starting price alerts:
startAlerts()

const userCommands: Map<number, string> = new Map();





//*				------ C O R E   L O G I C  ------

//* It is  important that this is above  "bot.on(message..." listeners. Avoid modularizing this unless you want to use a promise-based import/export approach.

bot.start((ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}
	ctx.reply(` To be able to use every feature please make sure to /signUp`);
});

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

//* ----------- U S E R S -----------

bot.command(['signUp', 'signup'], async (ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}

	const storedUser = await prisma.telegram_User.findFirst({
		where: {
			OR: [
			{telegramId: ctx.from.id},
			{email: ctx.message.text}
			]
		},
	});

	if (storedUser) {
		ctx.reply('You are already signed up.');
		return;
	}

	ctx.reply('Please enter your email address.');

	userCommands.set(ctx.from.id, 'signUp');
});

bot.command(['deleteAccount', 'deleteaccount'], async (ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}

	const foundUser = await prisma.telegram_User.findFirst({
		where: {
			telegramId: ctx.from.id,
		},
	});

	if (!foundUser) {
		
		ctx.reply("You don't have an account yet. Please make sure to /signup first.");
		return;
	}

	ctx.reply('Are you sure you want to delete your account? to confirm, enter your email')

	userCommands.set(ctx.from.id, 'deleteAccount');
});

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//* ----------- R E V I E W S -----------
bot.command(['getReviewsSumary', 'getReviewsSumary'], (ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}

	
	ctx.reply('Enter the URL of a product you want the summary of the reviews of.');
	userCommands.set(ctx.from.id, 'getReviewsSumary');
});

bot.command(['queryReviews', 'queryreviews'], (ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}

	ctx.reply(
		'Please provide both the product URL and your query separated by a space. For example: \n "https://example.com Do they metion something about the the quality being too bad?"'
	);

	userCommands.set(ctx.from.id, 'queryReviews');
});

//
//
//
//
//
//
//
//
//
//
//
//
//

//* ----------- D E T A I L S -----------

bot.command(['queryProductDetails', 'queryproductdetails'], (ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}

	ctx.reply(
		'Please provide both the product URL and your query separated by a space. For example: \n "https://example.com is this pc able to run modern videogames?"'
	);

	userCommands.set(ctx.from.id, 'queryProductDetails');
});

bot.command(['compareProducts', 'compareproducts'], (ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}

	ctx.reply(
		'Please provide both the URL of both productsto comapare and your query. All separated by a space. For example: \n "https://example1.com https://example1.com which pc is better for gaming?"'
	);

	userCommands.set(ctx.from.id, 'compareProducts');
});

//
//
//
//
//
//
//
//
//
//
//
//
//

//* ----------- P R I C E S / T R A C K E R -----------
bot.command(['getAllPrices', 'getallprices'], (ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}
	ctx.reply('Enter the name of a product you want the list of prices of.');
	userCommands.set(ctx.from.id, 'getAllPrices');
});

bot.command(['addOneToTracker','addonetotracker'], (ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}
	ctx.reply('Enter the link of the product you want to add to the tracker.');
	userCommands.set(ctx.from.id, 'addOneToTracker');
})

bot.command(['deleteFromTracker','deletefromtracker'], (ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}
	ctx.reply('Enter the Id of the product you want to delete from the tracker.');
	userCommands.set(ctx.from.id, 'deleteFromTracker');
})

bot.command(['deleteAllFromTracker','deleteallfromtracker'], (ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}
	ctx.reply('Are you sure you want to delete all products from the tracker? Y/N');
	userCommands.set(ctx.from.id, 'deleteAllFromTracker');
})

bot.command(['checkForUpdates','checkforupdates	'], (ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}
	ctx.reply('To check for all updates please type "all". \n To check for a specific products please provide their ids separated by a comma, for example: \n 45,192,9');
	userCommands.set(ctx.from.id, 'checkForUpdates');
})

bot.command(['displayProducts','displayproducts	'], async (ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}
	await axiosErrorHandler(displayProductsAPI, ctx, true)()
})

bot.command(['setUpPriceAlerts','setupricealerts'], async (ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}
	await axiosErrorHandler(optInPriceAlerts, ctx, false)()
})

bot.command(['disablePriceAlerts','disablepricealerts'], async (ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}
	await axiosErrorHandler(optOutPriceAlerts, ctx, false)()
})

//
//
//
//
//
//
//
//
//
//
//
//
//

bot.hears(['/help', '/Help', '/HELP', 'help', 'Help', 'HELP'], (ctx) => {
	if (checkForExistingCommand(ctx)) {
		return;
	}
	ctx.reply(`Available commands:
		 
		📌 *Product Review & Analysis*
		\n /getReviewsSumary - Get the summary of the reviews of a product.
		\n /queryReviews - Ask a question about the reviews of a product.
		\n /queryProductDetails - Ask a question about the details of a product.
		\n /compareProducts - Compare the details of two products.

		📌 *Product Tracking & Alerts*
		\n /addOneToTracker - Provide the link of a product to add it to the tracker.
		\n /deleteFromTracker - Provide the ID of a product to delete it from the tracker.
		\n /deleteAllFromTracker - Delete all products from the tracker.
		\n /checkForUpdates - Check for updates on tracked products.
		\n /displayProducts - Display all your tracked products (does not perform a search for updates).
		\n /setUpPriceAlerts - Opt in to price alerts.
		\n /disablePriceAlerts - Opt out of price alerts.

		📌 *Product Price Data*
		\n /getAllPrices - Send a product name, get a JSON of titles and prices for analysis.

		📌 *User Account Management*
		\n /signup - Just by providing an email. Your session will be unique in this chat.
		\n /deleteAccount - Delete your email from the database :(

`);

});

//
//
//
//
//
//
//
//
//
//
//
//
//

//*   				--------- O N    M E S S A G E    L I S T E N E R ---------



//This extra logic is just needed to make user experience better.
//Telegraf doesn't nativel allows for add or remove event listeners.
//So we can't something like:

	//USER: /signup
    //TG:   Enter your name
	//USER: Miguel
	//TG:   User created successfuly!

//Telegraf only allows us to do something like

	//USER: /signup Miguel

// If you will use this bot for yourself you don't need to use this extra logic.

// If you want to give better user experince then feel free to copy what I did below


// It is important that this is below all other listeners listeners. Avoid modularizing this unless you want to use a promise-based import/export.
bot.on(message('text'), async (ctx) => {
	if (ctx.message.text.startsWith('/')) {
		return; // Do nothing for commands
	}

	const userId = ctx.from.id;
	const userCommand = userCommands.get(userId);

	
	//$ When prompted to send a plain message we will check which is the command that the user has stored
	if (userCommand) {
		/**
		 * Handles user commands and routes them through axiosErrorHandler.
		 * Ensures consistent error handling across API requests.
		 */
		if (userCommand === 'signUp') {
			await axiosErrorHandler(signUp, ctx, false)();  //Axios or other function that needs to run based on the user's command.
			userCommands.delete(userId);
		
		} else if (userCommand === 'deleteAccount') {
			await axiosErrorHandler(deleteAccountAPI, ctx, true)();
			userCommands.delete(userId);
		
		} else if (userCommand === 'getReviewsSumary') {
			await axiosErrorHandler(getReviewsSumamryAPI, ctx, true)();
			userCommands.delete(userId);
		
		} else if (userCommand === 'queryReviews') {
			await axiosErrorHandler(queryReviewsAPI, ctx, true)();
			userCommands.delete(userId);
		
		} else if (userCommand === 'queryProductDetails') {
			await axiosErrorHandler(queryDetailsAPI, ctx, true)();
			userCommands.delete(userId);
		
		} else if (userCommand === 'compareProducts') {
			await axiosErrorHandler(compareProductsAPI, ctx, true)();
			userCommands.delete(userId);
		
		} else if (userCommand === 'getAllPrices') {
			await axiosErrorHandler(getAllPricesAPI, ctx, true)();
			userCommands.delete(userId);
		
		} else if (userCommand === 'addOneToTracker') {
			await axiosErrorHandler(addOneToTrackerAPI, ctx, true)();
			userCommands.delete(userId);
		
		} else if (userCommand === 'deleteFromTracker') {
			await axiosErrorHandler(deleteFromTrackerAPI, ctx, true)();
			userCommands.delete(userId);
		
		} else if (userCommand === 'deleteAllFromTracker') {
			if (['Y', 'y'].includes(ctx.message.text)) {
				await axiosErrorHandler(deleteAllFromTrackerAPI, ctx, true)();
			} else {
				ctx.reply('No products deleted');
			}
			userCommands.delete(userId);
		
		} else if (userCommand === 'checkForUpdates') {
			await axiosErrorHandler(checkForUpdatesAPI, ctx, true)();
			userCommands.delete(userId);
		}
		

	
	} else {
		userCommands.delete(userId); 
		ctx.reply(
			'Please enter a command first.  Type /help for a list of commands.'
		);
	}
});



function checkForExistingCommand(ctx: any): true | undefined {
	const userId = ctx.from.id;
	if (userCommands.has(userId)) {
		
		ctx.reply(`Expected a replie for /${userCommands.get(userId)} ⚠️  Please try again sending a new command.`);

		userCommands.delete(userId);

		return true;
	}
}

export const startBot = () => {
	bot.launch();
};
