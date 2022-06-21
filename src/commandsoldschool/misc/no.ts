import Client from '../../structures/Client';

import Command, { RunCallback } from '../../structures/Command';
import { Message } from 'discord.js';

const run: RunCallback = async (
  client: Client,
  message: Message,
  args: string[]
) => {
  return await message.channel.send('yes');
};

export const noCommand: Command = {
  name: 'no',
  run,
};

module.exports = noCommand;
