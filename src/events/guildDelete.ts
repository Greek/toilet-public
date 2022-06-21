import Event from '../structures/Event';
import Client from '../structures/Client';

import { MessageEmbed, Guild, TextChannel } from 'discord.js';
import { checkAllowlist } from '../util/permission';
import { failedEmbed } from '../util/embed';
import { checkIcon } from '../util/imageHandler';

const fs = require('fs');
const path = require('path');

const guildDelete = async (client: Client, guild: Guild) => {
  const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../config.json'))
  );

  if (process.env.DISCORD_DEV)
    if (!config.allowlistServers.includes(guild.id)) return;

  if (!config.guildLog)
    return console.log(
      '[Guild Log] Did not find guild logging channel, returning.'
    );

  const channel = client.channels.cache.get(config.guildLog) as TextChannel;
  const embed = new MessageEmbed()
    .setColor(failedEmbed)
    .setTitle(`Guild left | ${guild.name} (${guild.id})`)
    .setAuthor({ name: guild.name, iconURL: `${checkIcon(guild.iconURL())}` })
    .addFields(
      {
        name: 'Owner',
        value: `<@${guild.ownerId}>`,
        inline: true,
      },
      //   {
      //     name: 'Invite code',
      //     value: `${guild.invites.cache
      //       .map((invites) => invites.code)
      //       .join('\n')} (may not get all, or any invites)`,
      //     inline: true,
      //   },
      {
        name: 'On Allowlist?',
        value: `${checkAllowlist(config, guild)}`,
        inline: true,
      }
    )
    .setTimestamp(new Date())
    .setFooter({ text: `Owner ID: ${guild.ownerId}` });

  if (!channel) return;

  return channel.send({ embeds: [embed] }).catch(() => {
    // Don't do anything, we're not in guild anyway.
  });
};

const GuildDeleteEvent: Event = {
  name: 'guildDelete',
  run: guildDelete,
};

module.exports = GuildDeleteEvent;
