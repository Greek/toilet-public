// @ts-nocheck

import Client from '../structures/Client';
import Event from '../structures/Event';
import mongo from '../util/mongo';
import guildConfigSchema from '../schemas/guildConfigSchema';

import {
  Collection,
  Message,
  MessageEmbed,
  Snowflake,
  TextChannel,
} from 'discord.js';
import { failedEmbed } from '../util/embed';
import { checkIcon } from '../util/imageHandler';
import { snipes } from '..';

const fs = require('fs');
const path = require('path');

const messageDeleteBulk = async (
  client: Client,
  message: Collection<Snowflake, Message>
) => {
  const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../config.json'))
  );
  if (!message) return;
  let messageInfo = {};

  message.findKey((m) => {
    messageInfo = {
      author: m.author,
      ogChannel: m.channel,
      guild: m.guild,
    };
  });

  if (!config.allowlistServers.includes(messageInfo.guild.id)) return;

  const cache = {};

  // @ts-ignore
  let data = cache[messageInfo.guild.id];
  if (!data) {
    await mongo().then(async (m) => {
      try {
        const res = await guildConfigSchema.findOne({
          _id: messageInfo.guild.id!,
        });

        if (!res) return;

        // @ts-ignore
        cache[messageInfo.guild.id!] = data = [res.messageLog];
      } finally {
        m.connection.close();
      }
    });
  }

  if (data == null || data[0] == null || data[0] == 'false') {
    return;
  }

  const channel = client.channels.cache.get(data[0]) as TextChannel;

  const embed = new MessageEmbed()
    .setColor(`#ff0000`)
    .setTitle(`Messages bulk deleted (purge)`)
    .setDescription(`<#${messageInfo.ogChannel.id}>`)
    .setAuthor({
      name: messageInfo.author.tag,
    })
    .setFooter({ text: `Author ID: ${messageInfo.author.id}` })
    .setTimestamp(new Date());

  if (!channel) return;

  try {
    return await channel.send({ embeds: [embed] });
  } catch (e) {
    return client.sendErrorMessage(e, message);
  }
};

const MessageDeleteBulkEvent: Event = {
  name: 'messageDeleteBulk',
  run: messageDeleteBulk,
};

module.exports = MessageDeleteBulkEvent;
