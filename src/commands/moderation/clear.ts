// @ts-nocheck - `bulkDelete` isn't a method apparently.

import Client from '../../structures/Client';

import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandInteraction,
  Constants,
  DiscordAPIError,
  Message,
} from 'discord.js';
import { CommandSlash } from '../../structures/CommandSlash';
import { failedEmbedEphemeral, successEmbedEphemeral } from '../../util/embed';

export const command: CommandSlash = {
  builder: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a certain amount of messages at once.')
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription(
          'The amount of messages to delete, must be equal to or below 100.'
        )
        .setRequired(true)
    ),

  async run(client: Client, interaction: CommandInteraction) {
    if (!interaction.memberPermissions.has('MANAGE_MESSAGES')) return;
    if (!interaction.guild.me.permissions.has('MANAGE_MESSAGES'))
      return interaction.reply("I don't have permission to do that.");

    const limit = interaction.options.getInteger('limit');

    if (limit > 100) {
      await interaction.reply({
        embeds: [
          failedEmbedEphemeral(
            'Please enter a number below or equal to `100`.'
          ),
        ],
        ephemeral: true,
      });
    }

    try {
      await interaction.channel.bulkDelete(Number.parseInt(limit));

      return await interaction.reply({
        embeds: [successEmbedEphemeral(`Deleted ${limit} messages.`)],
        ephemeral: true,
      });
    } catch (e: any) {
      if (e instanceof DiscordAPIError)
        if (
          e.code === Constants.APIErrors.BULK_DELETE_MESSAGE_TOO_OLD ||
          Constants.APIErrors.UNKNOWN_MESSAGE
        )
          return await interaction.reply({
            embeds: [
              failedEmbedEphemeral("Couldn't find any messages to delete."),
            ],
            ephemeral: true,
          });

      client.sendErrorMessage(e, interaction);
    }
  },
};
