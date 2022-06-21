// @ts-nocheck

import Client from '../../structures/Client';

import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandInteraction,
  Constants,
  DiscordAPIError,
  GuildMember,
  MessageActionRow,
  MessageButton,
} from 'discord.js';
import { CommandSlash } from '../../structures/CommandSlash';
import {
  failedEmbedEphemeral,
  missingPermissionMessage,
  selfMissingPermissionMessage,
} from '../../util/embed';
import { runBoosterBanFlow } from './flows/ban-booster-flow';

export const command: CommandSlash = {
  builder: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member.')
    .addUserOption((option) =>
      option
        .setName('member')
        .setDescription('The person you want to ban.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Reason to ban')
    ),
  async run(client: Client, interaction: CommandInteraction) {
    if (!interaction.memberPermissions.has('BAN_MEMBERS'))
      return await interaction.reply({
        embeds: [missingPermissionMessage(interaction.user, 'ban_members')],
      });
    if (!interaction.guild.me.permissions.has('BAN_MEMBERS'))
      return await interaction.reply({
        embeds: [selfMissingPermissionMessage(interaction.user, 'ban_members')],
        ephemeral: true,
      });

    const user = interaction.options.getMember('member') as GuildMember;
    const reason = interaction.options.getString('reason');
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('ban')
        .setLabel(`Do it.`)
        .setStyle('DANGER'),
      new MessageButton()
        .setCustomId('dont-ban')
        .setLabel(`Nevermind.`)
        .setStyle('SECONDARY')
    );

    const filter = (i: any) => i.user.id === interaction.user.id;
    const collector = interaction.channel!.createMessageComponentCollector({
      filter,
    });

    if (user.id === interaction.user.id)
      return await interaction.reply({
        embeds: [failedEmbedEphemeral("You can't ban yourself!")],
        ephemeral: true,
      });

    if (user.premiumSince) {
      return runBoosterBanFlow(interaction, user, reason, row, collector);
    }

    try {
      await user.bans({
        reason: reason
          ? `[${interaction.user.tag}] ${reason}`
          : `[${interaction.user.tag}] No reason provided.`,
      });

      return await interaction.reply({
        content: '<:smoke:953134627608993842>',
      });
    } catch (e: any) {
      if (e instanceof DiscordAPIError)
        if (e.code === Constants.APIErrors.MISSING_PERMISSIONS)
          return await interaction.reply({
            embeds: [
              failedEmbedEphemeral(
                `Cannot ban \`${user.user.tag}\`, I may not have permission.`
              ),
            ],
            ephemeral: true,
          });

      client.sendErrorMessage(e, interaction);
    }
  },
};
