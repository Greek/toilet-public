import Event from '../structures/Event';
import Client from '../structures/Client';

import { MessageEmbed, Guild, TextChannel } from 'discord.js';
import { checkAllowlist } from '../util/permission';
import { successEmbed } from '../util/embed';
import { checkIcon } from '../util/imageHandler';

const fs = require('fs');
const path = require('path');

const guildCreate = async (client: Client, guild: Guild) => {
  const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../config.json'))
  );

  if (!config.allowlistServers.includes(guild.id)) return guild.leave();

  if (!config.guildLog)
    return console.log(
      '[Guild Log] Did not find guild logging channel, returning.'
    );

  const channel = client.channels.cache.get(config.guildLog) as TextChannel;
  const embed = new MessageEmbed()
    .setColor(successEmbed)
    .setTitle(`Guild joined | ${guild.name} (${guild.id})`)
    .setAuthor({ name: guild.name, iconURL: `${checkIcon(guild.iconURL())}` })
    .addFields(
      {
        name: 'Owner',
        value: `<@${guild.ownerId}>`,
        inline: true,
      },
      {
        name: 'Member count',
        value: `${guild.memberCount}`,
        inline: true,
      },
      {
        name: 'On Allowlist?',
        value: `${checkAllowlist(config, guild)}`,
        inline: true,
      },
      {
        name: 'Invite code',
        value: `${(await guild.invites.fetch())
          .map((invites) => invites.code)
          .join('\n')} (may not get all, or any invites)`,
      }
    )
    .setTimestamp(guild.joinedAt)
    .setFooter({ text: `Owner ID: ${guild.ownerId}` });

  if (!channel) return;

  return channel.send({ embeds: [embed] }).catch(() => {
    // Don't do anything, we're not in guild anyway.
  });
};

const guildCreateEvent: Event = {
  name: 'guildCreate',
  run: guildCreate,
};

module.exports = guildCreateEvent;
