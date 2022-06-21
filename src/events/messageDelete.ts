// @ts-nocheck

import Client from '../structures/Client';
import Event from '../structures/Event';
import mongo from '../util/mongo';
import guildConfigSchema from '../schemas/guildConfigSchema';

import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { failedEmbed } from '../util/embed';
import { checkIcon } from '../util/imageHandler';
import { snipes } from '..';

const fs = require('fs');
const path = require('path');

const messageDelete = async (client: Client, message: Message) => {
  const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../config.json'))
  );

  if (!config.allowlistServers.includes(message.guild.id)) return;

  if (!message) return;
  if (message.author.bot) return;
  if (message.partial || !message.author.tag) {
    console.log(
      '[Message(Delete)] Tried to log null message: %s',
      message.content
    );
    return;
  }

  const cache = {};

  // @ts-ignore
  let data = cache[message.guild.id];
  if (!data) {
    await mongo().then(async (m) => {
      try {
        const res = await guildConfigSchema.findOne({
          _id: message.guild!.id,
        });

        if (!res) return;

        // @ts-ignore
        cache[message.guild.id] = data = [res.messageLog];
      } finally {
        m.connection.close();
      }
    });
  }

  if (data == null || data[0] == null || data[0] == 'false') {
    return;
  }

  const channel = client.channels.cache.get(data[0]) as TextChannel;
  const messageChannel = client.channels.cache.get(
    message.channelId
  ) as TextChannel;

  const cleanupMessage =
    message.content.length > 1024
      ? message.content.slice(0, 1021) + '..'
      : message.content;

  const embed = new MessageEmbed()
    .setColor(failedEmbed)
    .setTitle(`Message deleted`)
    .setDescription(`<#${messageChannel.id}>`)
    .setAuthor({
      name: message.author.tag,
      iconURL: `${checkIcon(message.author.avatarURL())}`,
    })
    .setFooter({
      text: `Message ID: ${message.id}\nAuthor ID: ${message.author.id}`,
    })
    .setTimestamp(message.createdAt);

  message.content
    ? embed.setFields({
        name: 'Content',
        value: `${cleanupMessage}`,
      })
    : null;

  message?.attachments?.first()
    ? embed.setImage(`${message?.attachments?.first().proxyURL}`)
    : null;

  snipes[message.channel.id] = {
    author: message.author,
    channel: message.channel.name,
    content: message.content,
    attachments: message.attachments.first()
      ? message.attachments.first().proxyURL
      : null,
    date: message.createdAt,
  };

  if (!channel) return;

  return channel
    .send({ embeds: [embed] })
    .catch((e) =>
      console.log("[MSG(Delete)] Can't send to null channel: %s", e)
    );
};

const MessageDeleteEvent: Event = {
  name: 'messageDelete',
  run: messageDelete,
};

module.exports = MessageDeleteEvent;
