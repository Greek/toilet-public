import Client from '../../structures/Client';

import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, DiscordAPIError } from 'discord.js';
import { CommandSlash } from '../../structures/CommandSlash';
import {
  failedEmbedReply,
  missingPermissionMessage,
  selfMissingPermissionMessage,
  successEmbedReply,
} from '../../util/embed';
import { Constants } from 'discord.js';

export const command: CommandSlash = {
  builder: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Manage certain roles.')
    .addSubcommandGroup((user) =>
      user
        .setName('user')
        .setDescription("Manage user's roles.")
        .addSubcommand((add) =>
          add
            .setName('add')
            .setDescription('Add a role to a user.')
            .addUserOption((u) =>
              u
                .setName('user')
                .setDescription('The user you want to edit')
                .setRequired(true)
            )
            .addRoleOption((r) =>
              r
                .setName('role')
                .setDescription('The role you want to add')
                .setRequired(true)
            )
        )
        .addSubcommand((remove) =>
          remove
            .setName('remove')
            .setDescription('Remove a role')
            .addUserOption((u) =>
              u
                .setName('user')
                .setDescription('The user you want to edit')
                .setRequired(true)
            )
            .addRoleOption((r) =>
              r
                .setName('role')
                .setDescription('The role you want to remove')
                .setRequired(true)
            )
        )
    ),
  async run(client: Client, interaction: CommandInteraction) {
    if (!interaction.memberPermissions.has('MANAGE_ROLES'))
      return await interaction.reply({
        embeds: [missingPermissionMessage(interaction.user, 'manage_roles')],
      });
    if (!interaction.guild.me.permissions.has('MANAGE_ROLES'))
      return await interaction.reply({
        embeds: [
          selfMissingPermissionMessage(interaction.user, 'manage_roles'),
        ],
        ephemeral: true,
      });

    if (interaction.options.getSubcommandGroup() === 'user') {
      if (interaction.options.getSubcommand() === 'add') {
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');

        return await interaction.guild.members
          .resolve(user.id)
          .roles.add(role.id)
          .then(() => {
            interaction.reply({
              embeds: [
                successEmbedReply(
                  interaction.user,
                  `Added <@${user.id}> to <@&${role.id}>.`
                ),
              ],
            });
          })
          .catch((e: DiscordAPIError) => {
            if (e.code == Constants.APIErrors.MISSING_PERMISSIONS)
              interaction.reply({
                embeds: [
                  failedEmbedReply(
                    interaction.user,
                    `I don't have permission to give that role.`
                  ),
                ],
              });
            if (e.code == Constants.APIErrors.UNKNOWN_ROLE)
              interaction.reply({
                embeds: [
                  failedEmbedReply(
                    interaction.user,
                    `That role doesn't exist.`
                  ),
                ],
              });
          });
      }
      if (interaction.options.getSubcommand() === 'remove') {
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');

        return await interaction.guild.members
          .resolve(user.id)
          .roles.remove(role.id)
          .then(() => {
            interaction.reply({
              embeds: [
                successEmbedReply(
                  interaction.user,
                  `Removed <@&${role.id}> from <@${user.id}>`
                ),
              ],
            });
          })
          .catch((e: DiscordAPIError) => {
            if (e.code == Constants.APIErrors.MISSING_PERMISSIONS)
              interaction.reply({
                embeds: [
                  failedEmbedReply(
                    interaction.user,
                    `I couldn't remove that role.`
                  ),
                ],
              });
            if (e.code == Constants.APIErrors.UNKNOWN_ROLE)
              interaction.reply({
                embeds: [
                  failedEmbedReply(
                    interaction.user,
                    `This user doesn't have this role.`
                  ),
                ],
              });
          });
      }
    }
  },
};
