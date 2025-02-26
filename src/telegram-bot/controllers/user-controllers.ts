import axios from "axios";
import { CreateUserSchemaType } from "../../zod-schemas/users-schemas.js";
import { prisma } from "../../server-setup.js";

type AxiosFunctionAuth = (ctx: any, token: string | null) => Promise<void>;

export const signUp: AxiosFunctionAuth = async (ctx, _token) => {
	ctx.reply('Please wait...'); // Notify user that the process has started

	// Send a request to create a new user in the backend
	const response = await axios.post('http://127.0.0.1:3000/users/signup', {
		username: `telegram_user${ctx.from.id}`, // Assign a unique username based on Telegram ID
		email: ctx.message.text, // Use provided email from the Telegram message
		password: `Telegram${ctx.from.id}`, // Generate a simple password
	} as CreateUserSchemaType);

	const receivedUser = response.data.user; // Extract the created user details

	// Store the newly created user in the database
	const user = await prisma.telegram_User.create({
		data: {
			telegramId: ctx.from.id, // Store Telegram user ID
			storedUserId: receivedUser.id, // Save the backend user ID
			token: response.data.token, // Store the received authentication token
			email: ctx.message.text, // Save the email for reference
		},
	});

	if (!user) {
		ctx.reply('Error creating user'); // Notify user in case of failure
		return;
	}

	ctx.reply('User created successfully.'); // Notify user of success
};

export const deleteAccountAPI: AxiosFunctionAuth = async (ctx, token) => {

	// Find the user in the database by email
	const foundByEmail = await prisma.telegram_User.findFirst({
		where: {
			email: ctx.message.text
		}
	});

	if (!foundByEmail) {
		ctx.reply('Invalid email'); // Inform user if email is not found
		return;
	}

	ctx.reply('Please wait...'); // Notify user that deletion is in progress

	// Send a request to delete the user from the backend
	const response = await axios.delete('http://127.0.0.1:3000/users/delete', {
		headers: {
			Authorization: `Bearer ${token}`, // Include token for authentication
		},
	});

	ctx.reply('Puff... ' + response.data.data); // Notify user of deletion response
};