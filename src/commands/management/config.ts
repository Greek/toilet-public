import mongo from '../../util/mongo';
import Client from '../../structures/Client';
import welcomeSchema from '../../schemas/welcomeSchema';
import guildConfigSchema from '../../schemas/guildConfigSchema';

import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandSlash } from '../../structures/CommandSlash';
import { ChannelType } from 'discord-api-types';
import { successEmbedEphemeral } from '../../util/embed';

export const command: CommandSlash = {
  builder: new SlashCommandBuilder()
    .setName('zen')
    .setDescription('Configure specific values for this server.')
    .addSubcommandGroup((welcomeGroup) =>
      welcomeGroup
        .setName('welcome')
        .setDescription('Configuration for a welcome channel and message')
        .addSubcommand((sb) =>
          sb
            .setName('set')
            .setDescription('Set the welcome channel and message.')
            .addChannelOption((ch) =>
              ch
                .setName('channel')
                .setDescription('Set the channel the message will be sent in.')
                .addChannelType(0) // ChannelType.GuildText
                .setRequired(true)
            )
            .addStringOption((str) =>
              str
                .setName('message')
                .setDescription(
                  'Welcome message. Special Values: {mention}, {name}, {tag}'
                )
                .setRequired(true)
            )
        )
        .addSubcommand((sb) =>
          sb
            .setName('clear')
            .setDescription('Clear welcome channel and message.')
        )
    )
    .addSubcommandGroup((messageLogGroup) =>
      messageLogGroup
        .setName('msglog')
        .setDescription('Configuration for a message log channel')
        .addSubcommand((sb) =>
          sb
            .setName('set')
            .setDescription('Set the message logging channel.')
            .addChannelOption((str) =>
              str
                .setName('channel')
                .setDescription('The channel for logging.')
                .addChannelType(0) // ChannelType.GuildText
                .setRequired(true)
            )
        )
        .addSubcommand((sb) =>
          sb.setName('clear').setDescription('Clear message log channel.')
        )
    )
    .addSubcommandGroup((colors) =>
      colors
        .setName('colors')
        .setDescription('Configuration for custom role colors')
        .addSubcommand((sb) =>
          sb
            .setName('enable')
            .setDescription('Enable custom role colors')
            .addRoleOption((option) =>
              option
                .setName('colors-role')
                .setDescription('The role that the colors will be made after.')
                .setRequired(true)
            )
        )
        .addSubcommand((sb) =>
          sb.setName('disable').setDescription('Disable custom colors')
        )
    )
    .addSubcommandGroup((snipe) =>
      snipe
        .setName('snipe')
        .setDescription('Enable the snipe command')
        .addSubcommand((sb) =>
          sb.setName('enable').setDescription('Enable the snipe command')
        )
        .addSubcommand((sb) =>
          sb.setName('disable').setDescription('Disable the snipe command')
        )
    ),
  async run(client: Client, interaction: CommandInteraction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const colorConfigRole = interaction.options.getRole('colors-role');

    if (!interaction.memberPermissions!.has('ADMINISTRATOR'))
      return interaction.reply({
        content: "You don't have permission to do this.",
        ephemeral: true,
      });

    if (interaction.options.getSubcommandGroup() == 'welcome') {
      if (interaction.options.getSubcommand() == 'set') {
        await mongo().then(async (m) => {
          try {
            await welcomeSchema.findOneAndUpdate(
              { _id: interaction.guild!.id },
              {
                _id: interaction.guild!.id,
                channelId: channel,
                text: message,
              },
              { upsert: true }
            );
            interaction.reply({
              embeds: [
                successEmbedEphemeral('Set welcome message and channel.'),
              ],
              ephemeral: true,
            });
          } catch (e) {
            console.log(e);
          } finally {
            m.connection.close();
          }
        });
      }
      if (interaction.options.getSubcommand() == 'clear') {
        await mongo().then(async (m) => {
          try {
            await welcomeSchema.findOneAndRemove({
              _id: interaction.guild!.id,
            });
          } finally {
            m.connection.close();
          }
        });
        return interaction.reply({
          embeds: [
            successEmbedEphemeral('Cleared welcome message and channel.'),
          ],
          ephemeral: true,
        });
      }
    }

    if (interaction.options.getSubcommandGroup() == 'msglog') {
      if (interaction.options.getSubcommand() == 'set') {
        await mongo().then(async (m) => {
          try {
            await guildConfigSchema.findOneAndUpdate(
              { _id: interaction.guild!.id },
              {
                _id: interaction.guild!.id,
                messageLog: channel,
              },
              { upsert: true }
            );
            interaction.reply({
              embeds: [successEmbedEphemeral('Set message logging channel.')],
              ephemeral: true,
            });
          } catch (e) {
            console.log(e);
          } finally {
            m.connection.close();
          }
        });
      }
      if (interaction.options.getSubcommand() == 'clear') {
        await mongo().then(async (m) => {
          try {
            await guildConfigSchema.findOneAndUpdate(
              {
                _id: interaction.guild!.id,
              },
              {
                _id: interaction.guild!.id,
                messageLog: 'false',
              },
              {
                upsert: true,
              }
            );
          } finally {
            m.connection.close();
          }
        });
        return interaction.reply({
          embeds: [successEmbedEphemeral('Cleared message logging channel.')],
          ephemeral: true,
        });
      }
    }

    if (interaction.options.getSubcommandGroup() == 'colors') {
      if (interaction.options.getSubcommand() == 'enable') {
        await mongo().then(async (m) => {
          try {
            await guildConfigSchema.findOneAndUpdate(
              { _id: interaction.guild!.id },
              {
                _id: interaction.guild!.id,
                colorsRole: colorConfigRole!.id,
              },
              { upsert: true }
            );
            interaction.reply({
              embeds: [successEmbedEphemeral('Set the color role.')],
              ephemeral: true,
            });
          } catch (e) {
            console.log(e);
          } finally {
            m.connection.close();
          }
        });
      }
      if (interaction.options.getSubcommand() == 'disable') {
        await mongo().then(async (m) => {
          try {
            await guildConfigSchema.findOneAndUpdate(
              { _id: interaction.guild!.id },
              {
                _id: interaction.guild!.id,
                colorsRole: false,
              }
            );
            interaction.reply({
              embeds: [
                successEmbedEphemeral('Deleted color role configuration.'),
              ],
              ephemeral: true,
            });
          } catch (e) {
            console.log(e);
          } finally {
            m.connection.close();
          }
        });
      }
    }

    if (interaction.options.getSubcommandGroup() == 'snipe') {
      if (interaction.options.getSubcommand() == 'enable') {
        await mongo().then(async (m) => {
          try {
            await guildConfigSchema.findOneAndUpdate(
              { _id: interaction.guild!.id },
              {
                _id: interaction.guild!.id,
                snipeConfig: true,
              },
              { upsert: true }
            );
            interaction.reply({
              embeds: [successEmbedEphemeral('Enabled `/snipe`.')],
              ephemeral: true,
            });
          } catch (e) {
            console.log(e);
          } finally {
            m.connection.close();
          }
        });
      }
      if (interaction.options.getSubcommand() == 'disable') {
        await mongo().then(async (m) => {
          try {
            await guildConfigSchema.findOneAndUpdate(
              { _id: interaction.guild!.id },
              {
                snipeConfig: false,
              },
              { upsert: true }
            );
            interaction.reply({
              embeds: [successEmbedEphemeral('Disabled `/snipe`.')],
              ephemeral: true,
            });
          } catch (e) {
            console.log(e);
          } finally {
            m.connection.close();
          }
        });
      }
    }
  },
};
