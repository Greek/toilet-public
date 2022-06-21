// @ts-nocheck

import mongo from '../../util/mongo';
import guildConfig from '../../schemas/guildConfigSchema';

import { SlashCommandBuilder } from '@discordjs/builders';
import { Client, ColorResolvable, CommandInteraction } from 'discord.js';
import { CommandSlash } from '../../structures/CommandSlash';
import { failedEmbedEphemeral, successEmbedReply } from '../../util/embed';

export const command: CommandSlash = {
  builder: new SlashCommandBuilder()
    .setName('color')
    .setDescription('Set a custom role color.')
    .addSubcommand((sb) =>
      sb
        .setName('set')
        .setDescription('Set a color (hex or RGB)')
        .addStringOption((option) =>
          option
            .setName('color')
            .setDescription('The color you want (hex or RGB)')
            .setRequired(true)
        )
    ),
  async run(client: Client, interaction: CommandInteraction) {
    if (!interaction.guild.me.permissions.has('MANAGE_ROLES'))
      return await interaction.reply({
        embeds: [
          selfMissingPermissionMessage(interaction.user, 'manage_roles'),
        ],
        ephemeral: true,
      });

    if (interaction.options.getSubcommand() == 'set') {
      const cache = {};
      //@ts-ignore
      const color = interaction.options.getString('color').replace('#', '');
      const user = interaction.guild?.members.cache.get(interaction.user.id);

      // @ts-ignore
      let data = cache[interaction.guild!.id];
      if (!data) {
        await mongo().then(async (m) => {
          try {
            const res = await guildConfig.findOne({
              _id: interaction.guildId,
            });

            if (!res) return;

            // @ts-ignore
            cache[interaction.guild!.id] = data = [res.id, res.colorsRole];
          } finally {
            m.connection.close();
          }
        });
      }

      if (data == null || data[1] == null || data[1] == 'false') {
        return interaction.reply({
          embeds: [failedEmbedEphemeral('This command is not enabled.')],
          ephemeral: true,
        });
      }

      const existingTagRole = interaction.guild?.roles.cache.find(
        (r) => r.name === interaction.user.tag
      );
      const existingRole = interaction.guild?.roles.cache.find(
        (r) => r.name === interaction.user.username
      );
      const setRole = data[1];

      if (user.roles.cache.has(existingRole?.id)) {
        return interaction.guild?.roles
          .edit(existingRole.id, {
            color: interaction.options
              .getString('color')
              .toUpperCase() as ColorResolvable,
          })
          .then(() =>
            interaction.reply({
              embeds: [successEmbedReply(interaction.user, 'Edited color.')],
            })
          )
          .catch((e) => {
            interaction.reply({
              embeds: [
                failedEmbedEphemeral(
                  'Could not use color. Is it valid? ' +
                    'Remember, colors must be in hex or RGB format! ;)'
                ),
              ],
            });
          });
      } else if (user.roles.cache.has(existingTagRole?.id)) {
        return interaction.guild?.roles
          .edit(existingTagRole.id, {
            color: interaction.options
              .getString('color')
              .toUpperCase() as ColorResolvable,
          })
          .then(() =>
            interaction.reply({
              embeds: [successEmbedReply(interaction.user, 'Edited color.')],
            })
          )
          .catch((e) => {
            interaction.reply({
              embeds: [
                failedEmbedEphemeral(
                  'Could not set color. The color config may be incorrectly set.'
                ),
              ],
              ephemeral: true,
            });
          });
      } else {
        if (existingRole)
          return interaction.guild?.roles
            .create({
              name: interaction.user.tag,
              color: color.toUpperCase() as ColorResolvable,
              position: interaction.guild!.roles.resolve(setRole).position + 1,
            })
            .then((r) => {
              let res = r.id;
              user.roles.add(res, 'Add custom role.');
              interaction.reply({
                embeds: [
                  successEmbedReply(
                    interaction.user,
                    `Added custom color role.`
                  ),
                ],
                ephemeral: true,
              });
            })
            .catch((e) => {
              interaction.reply({
                embeds: [
                  failedEmbedEphemeral(
                    'Could not set color. The color config may be incorrectly set.'
                  ),
                ],
                ephemeral: true,
              });
            });

        return interaction.guild?.roles
          .create({
            name: interaction.user.username,
            color: color.toUpperCase() as ColorResolvable,
            position: interaction.guild!.roles.resolve(setRole).position + 1,
          })
          .then((r) => {
            let res = r.id;
            // @ts-ignore
            user.roles.add(res, 'Add custom role.');
            interaction.reply({
              embeds: [
                successEmbedReply(interaction.user, `Added custom color role.`),
              ],
              ephemeral: true,
            });
          })
          .catch((e) => {
            interaction.reply({
              embeds: [
                failedEmbedEphemeral(
                  'Could not set color. The color config may be incorrectly set.'
                ),
              ],
              ephemeral: true,
            });
          });
      }
    }
  },
};
