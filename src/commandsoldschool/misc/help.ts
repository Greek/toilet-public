import Client from '../../structures/Client';

import Command, { RunCallback } from '../../structures/Command';
import { Message } from 'discord.js';

const run: RunCallback = async (
  client: Client,
  message: Message,
  args: string[]
) => {
  return await message.reply(
    'Visit https://toilet.apap04.com/commands for help with commands.'
  );
};

export const helpCommand: Command = {
  name: 'help',
  run,
};

module.exports = helpCommand;
