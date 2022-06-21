import Client from '../structures/Client';
import Event from '../structures/Event';
import path from 'path';

import { CommandInteraction } from 'discord.js';
import { failedEmbedEphemeral } from '../util/embed';
const fs = require('fs');

const interactionCreate = async (
  client: Client,
  interaction: CommandInteraction
) => {
  if (!interaction.isCommand()) return;

  const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../config.json'))
  );
  if (!config.allowlistServers.includes(interaction.guildId))
    return interaction.reply({
      embeds: [
        failedEmbedEphemeral(
          "This server isn't on the allowlist. Visit [our Discord server](https://apap04.com) for info."
        ),
      ],
      ephemeral: true,
    });

  const command = client.sCommands.get(interaction.commandName);
  if (!command) return;

  try {
    command.run(client, interaction);
  } catch (e: unknown) {
    if (e instanceof Error) {
      client.sendErrorMessage(e);
    }
  }
};

const InteractionCreateEvent: Event = {
  name: 'interactionCreate',
  run: interactionCreate,
};

module.exports = InteractionCreateEvent;
