import Client from '../../structures/Client';

import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  TextChannel,
} from 'discord.js';
import { CommandSlash } from '../../structures/CommandSlash';
import {
  cancellableEmbedWarning,
  failedEmbedEphemeral,
} from '../../util/embed';

export const command: CommandSlash = {
  builder: new SlashCommandBuilder()
    .setName('recreate-channel')
    .setDescription('Completely delete a channel then re-create it.'),
  async run(client: Client, interaction: CommandInteraction) {
    if (!interaction.memberPermissions!.has('MANAGE_CHANNELS')) return;
    if (!interaction.guild!.me!.permissions.has('MANAGE_CHANNELS'))
      return interaction.reply({
        embeds: [
          failedEmbedEphemeral(
            'I cannot delete channels, please give me permissions so I can re-create this channel.'
          ),
        ],
        ephemeral: true,
      });

    const channel = interaction.channel as TextChannel;
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('yes')
        .setLabel('Do it.')
        .setStyle('DANGER'),

      new MessageButton()
        .setCustomId('no')
        .setLabel('Nevermind!')
        .setStyle('SECONDARY')
    );

    const filter = (i: any) => i.user.id === interaction.user.id;

    const collector = interaction.channel!.createMessageComponentCollector({
      filter,
      time: 10000,
    });
    let notDeleteable = false;

    try {
      return await interaction
        .reply({
          embeds: [
            cancellableEmbedWarning(
              interaction.user,
              `Are you sure you want to re-create ${channel.name}? You may need to re-adjust permissions.`,
              `If you\'d like to cancel this, press on "Nevermind!" or wait 10 seconds.`
            ),
          ],
          components: [row],
          ephemeral: true,
        })
        .then((msg) => {
          collector.on('collect', async (i) => {
            if (i.customId === 'yes') {
              await channel.delete().catch(() => {
                notDeleteable = true;
                return interaction.editReply({
                  content: "I can't nuke this channel.",
                  embeds: [],
                  components: [],
                });
              });
              return await interaction
                .guild!.channels.create(channel.name, {
                  parent: channel.parent!.id,
                  topic: channel.topic!,
                  nsfw: channel.nsfw,
                  position: channel.rawPosition,
                  reason: 'Done!',
                })
                .then((ch) => {
                  ch.permissionOverwrites.set(
                    channel.permissionOverwrites.cache.toJSON()
                  );
                })
                .catch(() => {
                  notDeleteable = true;
                  interaction.editReply({
                    content: "I can't nuke this channel.",
                    embeds: [],
                    components: [],
                  });
                });
            } else if (i.customId === 'no') {
              await interaction
                .editReply({
                  content:
                    'Remember That Your Actions Have Consequenses. Do Not Abuse Them',
                  embeds: [],
                  components: [],
                })
                .catch(() => {
                  // Do nothing
                });
            }
          });

          collector.on('end', async (collected) => {
            if (notDeleteable) {
              return;
            }
            await interaction
              .editReply({
                content:
                  'Remember That Your Actions Have Consequenses. Do Not Abuse Them',
                embeds: [],
                components: [],
              })
              .catch(() => {
                // Do nothing
              });
          });
        });
    } catch (e) {
      client.sendErrorMessage(e, interaction);
    }
  },
};
