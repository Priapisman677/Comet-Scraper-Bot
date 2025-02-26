import axios from 'axios';
import { prisma } from '../server-setup.js';
import bot from './bot-setup.js';

// Define expected response structure for updates
interface UpdateResponseItem {
	update: boolean;
	updateMessage: string;
	currentPrice: number;
	lastTimeTracked: number;
	productName: string;
	productDetailsId: number;
}

interface CheckForUpdatesResponse {
	data: UpdateResponseItem[];
}

// Function to check for product price updates and notify users
async function performAlerts() {
	console.log('Alerts');

	// Fetch users who have opted in for price alerts
	const optedInUsers = await prisma.telegram_User.findMany({
		where: {
			priceAlerts: true,
		},
	});

	// Loop through each user to check for updates
	for (const user of optedInUsers) {
		try {
			// Request latest product updates for the user
			const response = await axios.post<CheckForUpdatesResponse>(
				`http://127.0.0.1:3000/tracker/checkforupdates`,
				{},
				{
					headers: {
						Authorization: `Bearer ${user.token}`, // Authenticate request with user's token
					},
				}
			);

			//* Filter out products that have no updates
			const updates = response.data.data.filter((updateObject) => {
				return updateObject.update === true;
			});

			// Send an alert if there are any product updates
				if (updates.length > 0) {
				bot.telegram.sendMessage(
					Number(user.telegramId),
					`⚡ ${updates.length} products have updates:\n\n` +
						updates.map(u => `📌 ${u.productName}: ${u.updateMessage}`).join('\n\n')
				);
			}
		} catch (error) {
			// No specific error handling, failing silently
		}
	}
}

//* Starts an interval that runs performAlerts every 60 seconds
export const startAlerts = async () => {
	setInterval(performAlerts, 10000);
};

