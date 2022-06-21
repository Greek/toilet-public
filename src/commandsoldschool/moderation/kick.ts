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
  if (!message.member.permissions.has('KICK_MEMBERS'))
    return await message.reply({
      embeds: [missingPermissionMessage(message.author, 'kick_members')],
    });

  if (!message.guild.me.permissions.has('KICK_MEMBERS'))
    return await message.reply({
      embeds: [selfMissingPermissionMessage(message.author, 'kick_members')],
    });

  const user = message.mentions.members.first();
  const reason = args[1];

  if (!user) {
    return await message.reply({
      embeds: [failedEmbedEphemeral('Please provide a user.')],
    });
  }

  if (user.id === message.author.id)
    return await message.reply({
      embeds: [failedEmbedEphemeral("You can't kick yourself!")],
    });

  try {
    await user.kick(
      reason
        ? `[${message.author.tag}] ${reason}`
        : `[${message.author.tag}] No reason provided.`
    );
    return await message.reply({
      content: '👍',
    });
  } catch (e: any) {
    if (e instanceof DiscordAPIError)
      if (e.code === Constants.APIErrors.MISSING_PERMISSIONS)
        return await message.reply({
          embeds: [
            failedEmbedEphemeral(
              `Cannot kick \`${user.user.tag}\`, I may not have permission.`
            ),
          ],
        });
    client.sendErrorMessage(e, message);
  }
};

export const kickCommand: Command = {
  name: 'kick',
  aliases: ['k'],
  run,
};

module.exports = kickCommand;
