import guildConfig from '../../schemas/guildConfigSchema';
import mongo from '../../util/mongo';
import Client from '../../structures/Client';

import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { editSnipes } from '../..';
import { failedEmbedEphemeral } from '../../util/embed';
import { CommandSlash } from '../../structures/CommandSlash';
import { checkIcon } from '../../util/imageHandler';

export const command: CommandSlash = {
  builder: new SlashCommandBuilder()
    .setName('editsnipe')
    .setDescription('Snipe the last edited message.'),
  async run(client: Client, interaction: CommandInteraction) {
    const cache = {};

    // @ts-ignore
    let data = cache[interaction.guild!.id];
    if (!data) {
      await mongo().then(async (m) => {
        try {
          const res = await guildConfig.findOne({
            _id: interaction.guildId,
          });

          if (!res) return;

          // @ts-ignore
          cache[interaction.guild!.id] = data = [res.id, res.snipeConfig];
        } finally {
          m.connection.close();
        }
      });
    }

    if (data == null || data[1] == null || data[1] == false) {
      return await interaction.reply({
        embeds: [failedEmbedEphemeral('This command is not enabled.')],
        ephemeral: true,
      });
    }

    // @ts-ignore
    const snipe = editSnipes[interaction.channel.id];

    if (!snipe)
      return await interaction.reply({
        content: "There's nothing to snipe :(",
        ephemeral: true,
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

    try {
      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      client.sendErrorMessage(e, interaction);
    }
  },
};
