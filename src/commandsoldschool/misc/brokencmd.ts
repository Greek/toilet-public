import Client from '../../structures/Client';

import Command, { RunCallback } from '../../structures/Command';
import { Message } from 'discord.js';

const run: RunCallback = async (
  client: Client,
  message: Message,
  args: string[]
) => {
  try {
    return;
    return await message.channel.sends('no');
  } catch (e) {
    client.sendErrorMessage(e, message);
  }
};

export const yesCommand: Command = {
  name: 'yes',
  run,
};

module.exports = yesCommand;
