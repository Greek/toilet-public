import Client from '../../structures/Client';

import Command, { RunCallback } from '../../structures/Command';
import {
  Constants,
  DiscordAPIError,
  GuildMember,
  Message,
  Role,
} from 'discord.js';
import {
  failedEmbedEphemeral,
  failedEmbedReply,
  missingPermissionMessage,
  selfMissingPermissionMessage,
  successEmbedReply,
} from '../../util/embed';

const run: RunCallback = async (
  client: Client,
  message: Message,
  args: string[]
) => {
  return;

  if (!message.member.permissions.has('MANAGE_ROLES'))
    return await message.reply({
      embeds: [missingPermissionMessage(message.author, 'manage_roles')],
    });
  if (!message.guild.me.permissions.has('MANAGE_ROLES'))
    return await message.reply({
      embeds: [selfMissingPermissionMessage(message.author, 'manage_roles')],
    });

  const user = args[2] as unknown as GuildMember;
  const role = args[3] as unknown as Role;

  if (!user)
    return await message.reply({
      embeds: [failedEmbedReply(message.author, 'Please provide a user.')],
    });

  if (!role)
    return await message.reply({
      embeds: [failedEmbedReply(message.author, 'Please provide a role.')],
    });

  if (args[0] === 'user') {
    if (args[1] === 'add') {
      return await message.guild.members
        .resolve(user.id)
        .roles.add(role.id)
        .then(() => {
          message.reply({
            embeds: [
              successEmbedReply(
                message.author,
                `Added <@${user.id}> to <@&${role.id}>.`
              ),
            ],
          });
        })
        .catch((e: DiscordAPIError) => {
          message.reply({
            embeds: [
              failedEmbedReply(message.author, `That's not a valid user.`),
            ],
          });
          if (e.code == Constants.APIErrors.UNKNOWN_USER) {
            message.reply({
              embeds: [
                failedEmbedReply(message.author, `That's not a valid user.`),
              ],
            });
          }
          if (e.code == Constants.APIErrors.MISSING_PERMISSIONS)
            message.reply({
              embeds: [
                failedEmbedReply(
                  message.author,
                  `I don't have permission to give that role.`
                ),
              ],
            });
          if (
            e.code == Constants.APIErrors.UNKNOWN_ROLE ||
            Constants.APIErrors.INVALID_ROLE
          )
            message.reply({
              embeds: [
                failedEmbedReply(message.author, `That role doesn't exist.`),
              ],
            });
        });
    }
  }
};

export const roleCommand: Command = {
  name: 'role',
  run,
};

module.exports = roleCommand;
