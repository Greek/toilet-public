// @ts-nocheck
import Client from '../../structures/Client';

import { SlashCommandBuilder } from '@discordjs/builders';
import {
  ColorResolvable,
  CommandInteraction,
  Constants,
  DiscordAPIError,
  GuildMember,
  MessageEmbed,
  Role,
} from 'discord.js';
import { CommandSlash } from '../../structures/CommandSlash';
import { failedEmbedEphemeral } from '../../util/embed';

export const command: CommandSlash = {
  builder: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get info about a user.')
    .addMentionableOption((mention) =>
      mention
        .setName('user')
        .setDescription("The user you want. (don't provide a role pls)")
        .setRequired(true)
    ),
  async run(client: Client, interaction: CommandInteraction) {
    let user = interaction.options.getMentionable('user') as GuildMember;

    const colorCheck = (color: ColorResolvable) => {
      if (color == '#000000') {
        return 'BLURPLE';
      }

      return color;
    };

    if (user instanceof Role) {
      return await interaction.reply({
        embeds: [failedEmbedEphemeral('Please provide a valid user.')],
        ephemeral: true,
      });
    }

    const description = `${user.displayName}`;

    const embed = new MessageEmbed()
      .setColor(colorCheck(user.displayHexColor))
      .setThumbnail(user.displayAvatarURL())
      .setFields(
        {
          name: 'Dates',
          value: `:hammer_pick: **Created**: ${
            user.user.createdAt?.getMonth() + 1
          }/${user.user.createdAt?.getDate()}/${user.user.createdAt?.getFullYear()}
          :door: **Joined**: ${
            user.joinedAt?.getMonth() + 1
          }/${user.joinedAt?.getDate()}/${user.joinedAt?.getFullYear()}`,
        },
        {
          name: 'Roles',
          value: `${user.roles.cache.map((role) => role.name).join(', ')}`,
        }
      )
      .setDescription(description)
      .setAuthor({ name: user.user.tag, iconURL: user.displayAvatarURL() })
      .setTimestamp(interaction.createdTimestamp)
      .setFooter({ text: `ID: ${user.id}` });

    try {
      return await interaction.reply({ embeds: [embed] });
    } catch (e: any) {
      if (e instanceof DiscordAPIError)
        if (e.code === Constants.APIErrors.UNKNOWN_USER)
          return await interaction.reply({
            embeds: [
              failedEmbedEphemeral(
                'Could not get info, did you provide a valid user?'
              ),
            ],
            ephemeral: true,
          });

      client.sendErrorMessage(e, interaction);
    }
  },
};
