require('dotenv').config();

import path from 'path';
import Client from './structures/Client';

import { Intents } from 'discord.js';

export const snipes = {};
export const editSnipes = {};

const bot = new Client({
  allowedMentions: { parse: ['users'] },
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ['USER', 'MESSAGE'],
});

bot.options.ws.properties.$browser = 'Discord iOS';
bot.options.ws.properties.$device = 'iPhone XR';
bot.options.ws.properties.$os = 'iOS 13.5';

bot.registerSlashCommands(path.join(__dirname, './commands'));
bot.registerCommands(path.join(__dirname, './commandsoldschool'));
bot.registerEvents(path.join(__dirname, './events'));
bot.registerDokdo();

process.on('uncaughtException', bot.sendRuntimeErrorMessage);
process.on('unhandledRejection', bot.sendRuntimeErrorMessage);
process.on('rejectionHandled', bot.sendRuntimeErrorMessage);

bot.login(process.env.DISCORD_TOKEN);
