// @ts-nocheck

import mongo from '../../util/mongo';
import tagSchema from '../../schemas/tagSchema';
import Client from '../../structures/Client';

import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from 'discord.js';
import { CommandSlash } from '../../structures/CommandSlash';
import { failedEmbedEphemeral } from '../../util/embed';

export const command: CommandSlash = {
  builder: new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Get a tag.')
    .addStringOption((name) =>
      name.setName('tag').setDescription('Name of the tag.').setRequired(true)
    ),
  async run(client: Client, interaction: CommandInteraction) {
    const name = interaction.options.getString('tag');

    await mongo().then(async (mongo) => {
      try {
        const res = await tagSchema.find({
          tagGuildId: interaction.guildId,
          tagId: name!.toLowerCase(),
        });

        if (!res[0])
          return interaction.reply({
            embeds: [
              failedEmbedEphemeral(
                `Couldn't find tag "${name!.toLowerCase()}"`
              ),
            ],
            ephemeral: true,
          });

        const row = new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel(`Tag ID: ${res[0].tagId}`)
            .setStyle('SECONDARY')
            .setDisabled(true)
            .setCustomId(`btn-${res[0].tagId}`)
        );

        interaction.reply({
          content: `${res[0].tagContent}`,
          components: [row],
        });
      } catch (e) {
        client.sendErrorMessage(e, interaction);
      } finally {
        mongo.connection.close();
        return;
      }
    });
  },
};
