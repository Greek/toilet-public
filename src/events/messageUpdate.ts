// @ts-nocheck

import Client from '../structures/Client';
import Event from '../structures/Event';
import mongo from '../util/mongo';
import guildConfigSchema from '../schemas/guildConfigSchema';

import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { warnEmbed } from '../util/embed';
import { checkIcon } from '../util/imageHandler';
import { editSnipes } from '..';

const fs = require('fs');
const path = require('path');

const messageUpdate = async (
  client: Client,
  message: Message,
  newMessage: Message
) => {
  const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../config.json'))
  );

  if (!config.allowlistServers.includes(message.guild.id)) return;
  if (newMessage.author.bot) return;
  if (message.content == newMessage.content) return; // Prevent logging embed updates, like links being sent
  if (message.partial || !message.author.tag) {
    console.log('[Message(Edit)] Tried to log null message');
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
      ? 'Could not get content, message is too long to check diff'
      : message.content;

  const cleanupNewMessage =
    newMessage.content.length > 1024
      ? 'Could not get content, message is too long to check diff'
      : newMessage.content;

  const embed = new MessageEmbed()
    .setColor(warnEmbed)
    .setTitle(`Message edited`)
    .setDescription(`<#${messageChannel.id}> ([Go to message](${message.url}))`)
    .setFields(
      { name: 'Before', value: `${cleanupMessage}` },
      { name: 'After', value: `${cleanupNewMessage}` }
    )
    .setAuthor({
      name: message.author.tag,
      iconURL: `${checkIcon(message.author.avatarURL())}`,
    })
    .setTimestamp(message.createdAt)
    .setFooter({ text: `Author ID: ${message.author.id}` });

  message?.attachments?.first()
    ? embed.setImage(`${message?.attachments?.first().proxyURL}`)
    : null;

  editSnipes[message.channel.id] = {
    author: message.author,
    channel: message.channel.name,
    content: message.content,
    attachments: message.attachments.first()
      ? message.attachments.first().proxyURL
      : null,
    date: message.createdAt,
  };

  if (!channel) return;

  channel
    .send({ embeds: [embed] })
    .catch((e) => console.log("[MSG(Delete)] Can't send to null channel"));
};

const MessageUpdateEvent: Event = {
  name: 'messageUpdate',
  run: messageUpdate,
};

module.exports = MessageUpdateEvent;
