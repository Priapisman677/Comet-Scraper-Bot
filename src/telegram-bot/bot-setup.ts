import { Telegraf } from 'telegraf';
import { Agent } from 'https';

/**
 * Some users experience connectivity issues with Telegram bots due to 
 * IPv6-related problems in Node.js or their ISP not supporting IPv6.
 * 
 * The workaround is to force Node.js to use IPv4 when making HTTPS requests.
 * This is done by setting `family: 4` in the `https.Agent` configuration.
 * 
 * This is OPTIONAL. If your bot works fine without it, you can remove this setting.
 */

const httpsAgent = new Agent({
	keepAlive: true, // Keeps the connection alive for better performance
	family: 4, // Forces IPv4 to avoid issues with ISPs that don't support IPv6
});

const bot = new Telegraf(process.env.BOT_TOKEN!, {
	telegram: {
		agent: httpsAgent, // Apply the forced IPv4 agent to Telegram requests
	},
});

export default bot; // The bot is initialized in `app.setup.ts` and configured in `bot.ts`
