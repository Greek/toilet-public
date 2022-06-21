import Client from '../../structures/Client';
import mongo from '../../util/mongo';
import guildConfigSchema from '../../schemas/guildConfigSchema';

import Command, { RunCallback } from '../../structures/Command';
import { Message, MessageEmbed } from 'discord.js';
import { failedEmbedEphemeral } from '../../util/embed';
import { snipes } from '../..';
import { checkIcon } from '../../util/imageHandler';

const run: RunCallback = async (
  client: Client,
  message: Message,
  args: string[]
) => {
  const cache = {};

  // @ts-ignore
  let data = cache[message.guild!.id];
  if (!data) {
    await mongo().then(async (m) => {
      try {
        const res = await guildConfigSchema.findOne({
          _id: message.guildId,
        });

        if (!res) return;

        // @ts-ignore
        cache[message.guild!.id] = data = [res.id, res.snipeConfig];
      } finally {
        m.connection.close();
      }
    });
  }

  if (data == null || data[1] == null || data[1] == false) {
    return await message.reply({
      embeds: [failedEmbedEphemeral('This command is not enabled.')],
    });
  }

  // @ts-ignore
  const snipe = snipes[message.channel.id];

  if (!snipe)
    return await message.reply({
      content: "There's nothing to snipe :(",
    });

  const embed = new MessageEmbed()
    .setAuthor({
      name: snipe.author.tag,
      iconURL: checkIcon(snipe.author.avatarURL()),
    })
    .setColor(snipe.author.displayHexColor)
    .setDescription(snipe.content)
    .setFooter({ text: `#${snipe.channel}` })
    .setTimestamp(snipe.date);

  snipe.attachments ? embed.setImage(snipe.attachments) : null;

  try {
    return await message.reply({ embeds: [embed] });
  } catch (e) {
    client.sendErrorMessage(e, message);
  }
};

export const snipeCommand: Command = {
  name: 'snipe',
  aliases: ['s', 'priviledgedintentcommand'],
  run,
};

module.exports = snipeCommand;
