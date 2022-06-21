import Client from '../../structures/Client';

import Command, { RunCallback } from '../../structures/Command';
import { Message } from 'discord.js';

const run: RunCallback = async (
  client: Client,
  message: Message,
  args: string[]
) => {
  const choices = ['the cavern', 'my tonka', 'cloud-based septic tank'];
  try {
    return await message.reply('Pinging...').then((m) =>
      m.edit({
        content: `pinged **${
          choices[Math.floor(Math.random() * choices.length)]
        }**, took \`${client.ws.ping}ms\` (\`${
          Date.now() - message.createdTimestamp
        }ms\`)`,
      })
    );
  } catch (e) {
    client.sendErrorMessage(e, message);
  }
};

export const pingCommand: Command = {
  name: 'ping',
  run,
};

module.exports = pingCommand;
