import welcomeSchema from '../schemas/welcomeSchema';
import Event from '../structures/Event';
import mongo from '../util/mongo';

import { Client, GuildMember, TextChannel } from 'discord.js';

const fs = require('fs');
const path = require('path');

const guildMemberAdd = async (client: Client, user: GuildMember) => {
  const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../config.json'))
  );

  if (!config.allowlistServers.includes(user.guild.id)) return;

  const cache = {};

  // @ts-ignore
  let data = cache[user.guild.id];
  if (!data) {
    await mongo().then(async (m) => {
      try {
        const res = await welcomeSchema.findOne({
          _id: user.guild.id,
        });

        if (!res) return;

        // @ts-ignore
        cache[user.guild.id] = data = [res.channelId, res.text];
      } finally {
        m.connection.close();
      }
    });
  }

  if (data == null) {
    return;
  }

  const channelId = data[0];
  const text = data[1]
    .replace(/{mention}/g, `<@${user.id}>`)
    .replace(/{name}/g, `${user.displayName}`)
    .replace(/{tag}/g, `${user.user.tag}`);

  const channel = user.guild.channels.cache.get(channelId) as TextChannel;
  if (!channel) return;

  return channel.send(text);
};
const GuildMemberAddEvent: Event = {
  name: 'guildMemberAdd',
  run: guildMemberAdd,
};

module.exports = GuildMemberAddEvent;
