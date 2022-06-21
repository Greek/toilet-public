import Client from '../../structures/Client';

import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { CommandSlash } from '../../structures/CommandSlash';

export const command: CommandSlash = {
  builder: new SlashCommandBuilder().setName('ping').setDescription('Pong!'),
  async run(client: Client, interaction: CommandInteraction) {
    const choices = ['the cavern', 'my tonka', 'cloud-based septic tank'];
    return await interaction.reply('Pinging...').then(() =>
      interaction.editReply({
        content: `pinged **${
          choices[Math.floor(Math.random() * choices.length)]
        }**, took \`${client.ws.ping}ms\` (\`${
          Date.now() - interaction.createdTimestamp
        }ms\`)`,
      })
    );
  },
};
