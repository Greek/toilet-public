import Client from '../../structures/Client';

import Command, { RunCallback } from '../../structures/Command';
import { Constants, DiscordAPIError, Message } from 'discord.js';
import {
  failedEmbedEphemeral,
  missingPermissionMessage,
  selfMissingPermissionMessage,
} from '../../util/embed';

const run: RunCallback = async (
  client: Client,
  message: Message,
  args: string[]
) => {
  if (!message.member.permissions.has('BAN_MEMBERS'))
    return message.reply({
      embeds: [missingPermissionMessage(message.author, 'ban_members')],
    });

  if (!message.guild.me.permissions.has('BAN_MEMBERS'))
    return message.reply({
      embeds: [selfMissingPermissionMessage(message.author, 'ban_members')],
    });

  const user = message.mentions.members.first();
  const reason = args[1];

  if (!user) {
    return message.reply({
      embeds: [failedEmbedEphemeral('Please provide a user.')],
    });
  }

  if (user.id === message.author.id)
    return message.reply({
      embeds: [failedEmbedEphemeral("You can't ban yourself!")],
    });

  try {
    await user.ban({
      reason: reason
        ? `[${message.author.tag}] ${reason}`
        : `[${message.author.tag}] No reason provided.`,
    });
    return await message.channel.send({
      content: '<:smoke:953134627608993842>',
    });
  } catch (e: any) {
    if (e instanceof DiscordAPIError)
      if (e.code === Constants.APIErrors.MISSING_PERMISSIONS)
        return await message.reply({
          embeds: [
            failedEmbedEphemeral(
              `Cannot ban \`${user.user.tag}\`, I may not have permission.`
            ),
          ],
        });
    client.sendErrorMessage(e, message);
  }
};

export const banCommand: Command = {
  name: 'ban',
  aliases: ['b'],
  run,
};

module.exports = banCommand;
