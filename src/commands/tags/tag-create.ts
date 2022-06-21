// @ts-nocheck

import mongo from '../../util/mongo';
import tagSchema from '../../schemas/tagSchema';
import Client from '../../structures/Client';

import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { CommandSlash } from '../../structures/CommandSlash';
import { failedEmbedEphemeral, successEmbedEphemeral } from '../../util/embed';

export const command: CommandSlash = {
  builder: new SlashCommandBuilder()
    .setName('tag-create')
    .setDescription('Create a tag.')
    .addStringOption((name) =>
      name.setName('name').setDescription('Name of the tag.').setRequired(true)
    )
    .addStringOption((content) =>
      content
        .setName('content')
        .setDescription('Content of the tag.')
        .setRequired(true)
    ),
  async run(client: Client, interaction: CommandInteraction) {
    const name = interaction.options.getString('name');
    const content = interaction.options.getString('content');

    await mongo().then(async (mongo) => {
      try {
        if (!content)
          return interaction.reply({
            embeds: [failedEmbedEphemeral('Please provide content.')],
          });

        if (
          await tagSchema.exists({
            tagGuildId: interaction.guildId!,
            tagId: name!.toLowerCase(),
          })
        )
          return interaction.reply({
            embeds: [failedEmbedEphemeral('That tag already exists.')],
            ephemeral: true,
          });

        await tagSchema.create({
          tagGuildId: interaction.guildId!,
          tagId: name!.toLowerCase(),
          tagContent: content
            .replace('@everyone', 'everyone')
            .replace('@here', 'here'),
        });

        interaction.reply({
          embeds: [
            successEmbedEphemeral(`Created tag "${name!.toLowerCase()}"`),
          ],
        });
      } catch (e) {
        console.log(e);
        client.sendErrorMessage(e, interaction);
      } finally {
        mongo.connection.close();
        return;
      }
    });
  },
};
