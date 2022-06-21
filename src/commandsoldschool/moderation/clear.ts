import Client from '../../structures/Client';

import Command, { RunCallback } from '../../structures/Command';
import { Constants, DiscordAPIError, Message, TextChannel } from 'discord.js';
import {
  failedEmbedEphemeral,
  missingPermissionMessage,
  selfMissingPermissionMessage,
  successEmbedEphemeral,
} from '../../util/embed';

const run: RunCallback = async (
  client: Client,
  message: Message,
  args: string[]
) => {
  if (!message.member.permissions.has('MANAGE_MESSAGES'))
    return message.reply({
      embeds: [missingPermissionMessage(message.author, 'MANAGE_MESSAGES')],
    });

  if (!message.guild.me.permissions.has('MANAGE_MESSAGES'))
    return message.reply({
      embeds: [selfMissingPermissionMessage(message.author, 'MANAGE_MESSAGES')],
    });

  const limit = Number.parseInt(args[0]);
  const textChannel = message.channel as TextChannel;

  if (limit > 100) {
    message.reply({
      embeds: [
        failedEmbedEphemeral('Please enter a number below or equal to `100`.'),
      ],
    });
  }

  const parsedLimit: number = limit == 100 ? limit : limit + 1;

  try {
    await textChannel.bulkDelete(parsedLimit);
    message.channel
      .send({
        embeds: [successEmbedEphemeral(`Deleted ${limit} messages.`)],
      })
      .then((m) => setTimeout(() => m.delete(), 3000));
  } catch (e: any) {
    if (e instanceof DiscordAPIError)
      if (
        e.code === Constants.APIErrors.BULK_DELETE_MESSAGE_TOO_OLD ||
        Constants.APIErrors.UNKNOWN_MESSAGE
      )
        return await message.reply({
          embeds: [
            failedEmbedEphemeral("Couldn't find any messages to delete."),
          ],
        });

    client.sendErrorMessage(e, message);
  }
};

export const clearCommand: Command = {
  name: 'clear',
  aliases: ['c', 'purge'],
  run,
};

module.exports = clearCommand;
