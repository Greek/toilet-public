// @ts-nocheck

import { CommandInteraction, GuildMember } from 'discord.js';
import {
  failedEmbedEphemeral,
  cancellableEmbedWarning,
} from '../../../util/embed';

export const runBoosterBanFlow = (
  interaction: CommandInteraction,
  user: GuildMember,
  reason: string,
  row: any,
  collector: any
) => {
  return interaction
    .reply({
      embeds: [
        cancellableEmbedWarning(
          interaction.user,
          'This user is a booster. Are you sure you want to ban them?',
          'You can click on "Nevermind" to cancel the action.'
        ),
      ],
      components: [row],
      ephemeral: false,
    })
    .then((msg) => {
      collector.on('collect', (c) => {
        if (c.customId === 'ban')
          return user
            .ban({
              reason: reason
                ? `[${interaction.user.tag}] ${reason}`
                : `[${interaction.user.tag}] No reason provided.`,
            })
            .then(
              () =>
                interaction.editReply({
                  content: '<:smoke:953134627608993842>',
                  ephemeral: false,
                  embeds: [],
                  components: [],
                }),
              collector.removeListener('collect', () => {})
            )
            .catch(
              () =>
                interaction.editReply({
                  embeds: [
                    failedEmbedEphemeral(
                      `Cannot ban \`${user.user.tag}\`, I may not have permission.`
                    ),
                  ],
                  ephemeral: true,
                  components: [],
                }),
              collector.removeListener('collect', () => {})
            );
        else if (c.customId === 'dont-ban') interaction.deleteReply();
        return collector.removeListener('collect', () => {});
      });
      collector.on('end', (c) => {
        // Do nothing.
      });
    });
};
