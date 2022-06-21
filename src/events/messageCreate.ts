import Client from '../structures/Client';
import Event from '../structures/Event';
import path from 'path';

import { Message } from 'discord.js';
import { failedEmbedEphemeral } from '../util/embed';

const fs = require('fs');

const messageCreate = async (client: Client, message: Message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  /* if (message.content.includes('real'.toLowerCase()))
    message
      .react(':real:940937016412090428')
      .catch((e) =>
        console.log('[MESSAGE(Create)]  Could not react with "real": %s', e)
      ); */

  if (message.content.startsWith('pls snipe'.toLowerCase()))
    message.reply('use `/snipe` lol');

  if (!message.content.startsWith(client.prefix)) return;

  const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../config.json'))
  );
  if (!config.allowlistServers.includes(message.guild.id))
    return message
      .reply({
        embeds: [
          failedEmbedEphemeral(
            "This server isn't on the allowlist. Visit [our Discord server](https://apap04.com) for info."
          ),
        ],
      })
      .then((m) => setTimeout(() => m.delete(), 150000));

  const args = message.content.slice(client.prefix.length).trim().split(/ +/g);
  const commandName = args.shift()!.toLowerCase();
  if (!commandName) return;

  const command =
    client.commands.get(commandName) ??
    client.commands.find((cmd) =>
      cmd.aliases ? cmd.aliases.includes(commandName) : false
    );
  if (!command) return;

  try {
    command.run(client, message, args);
  } catch (e) {
    client.sendErrorMessage(e, message);
  }
};

const MessageCreateEvent: Event = {
  name: 'messageCreate',
  run: messageCreate,
};

module.exports = MessageCreateEvent;
