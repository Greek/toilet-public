// @ts-nocheck

import Client from '../../structures/client';

import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Constants, DiscordAPIError } from 'discord.js';
import { CommandSlash } from '../../structures/CommandSlash';
import {
  failedEmbedEphemeral,
  missingPermissionMessage,
  selfMissingPermissionMessage,
} from '../../util/embed';

export const command: CommandSlash = {
  builder: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member.')
    .addUserOption((option) =>
      option
        .setName('member')
        .setDescription('The person you want to kick.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Reason for kicking')
    ),
  async run(client: Client, interaction: CommandInteraction) {
    if (!interaction.memberPermissions.has('KICK_MEMBERS'))
      return await interaction.reply({
        embeds: [missingPermissionMessage(interaction.user, 'kick_members')],
      });
    if (!interaction.guild.me.permissions.has('KICK_MEMBERS'))
      return await interaction.reply({
        embeds: [
          selfMissingPermissionMessage(interaction.user, 'kick_members'),
        ],
        ephemeral: true,
      });

    const user = interaction.options.getMember('member');
    const reason = interaction.options.getString('reason');

    if (user.id === interaction.user.id)
      return await interaction.reply({
        embeds: [failedEmbedEphemeral("You can't kick yourself!")],
        ephemeral: true,
      });

    try {
      await user.kick(
        reason
          ? `[${interaction.user.tag}] ${reason}`
          : `[${interaction.user.tag}] No reason provided.`
      );

      return await interaction.reply({
        content: '👍',
      });
    } catch (e: any) {
      if (e instanceof DiscordAPIError)
        if (e.code === Constants.APIErrors.MISSING_PERMISSIONS)
          return await interaction.reply({
            embeds: [
              failedEmbedEphemeral(
                `Cannot kick \`${user.user.tag}\`, I may not have permission.`
              ),
            ],
            ephemeral: true,
          });
      client.sendErrorMessage(e, interaction);
    }
  },
};
