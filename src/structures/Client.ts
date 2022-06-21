import path from 'path';
import Discord, {
  CommandInteraction,
  Interaction,
  Message,
  MessageEmbed,
  WebhookClient,
} from 'discord.js';
import Command from './Command';
import Event from './Event';
import Dokdo from 'dokdo';
import crypto from 'node:crypto';

import { owners } from '../util/permission';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { CommandSlash } from './CommandSlash';
import { errorEmbed, failedEmbed } from '../util/embed';

const fs = require('fs');

export default class Client extends Discord.Client {
  localConfig = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../config.json'))
  );

  commands = new Discord.Collection<Command['name'], Command>();
  sCommands = new Discord.Collection<string, CommandSlash>();
  prefix = this.localConfig.prefix;
  owners = owners;

  constructor(options: Discord.ClientOptions) {
    super(options);
  }

  registerCommands(commandsDir: string) {
    console.log('[Commands] Registering commands');

    const commandFiles = fs
      .readdirSync(`${commandsDir}`)
      .map((folder) =>
        fs
          .readdirSync(`${commandsDir}/${folder}`)
          .filter((file) => file.endsWith('.ts'))
          .map((file) => `${commandsDir}/${folder}/${file}`)
      )
      .flat();

    for (const file of commandFiles) {
      const command = require(file) as Command;
      this.commands.set(command.name, command);
      console.log('[Commands] Loaded %s', command.name);
    }
  }

  registerSlashCommands(slashCommandsDir: string) {
    console.log('[/] Registering slash commands');

    const commands = [];
    const slashCommandFiles = fs
      .readdirSync(`${slashCommandsDir}`)
      .map((folder) =>
        fs
          .readdirSync(`${slashCommandsDir}/${folder}`)
          .filter((file) => file.endsWith('.ts'))
          .map((file) => `${slashCommandsDir}/${folder}/${file}`)
      )
      .flat();

    for (const file of slashCommandFiles) {
      const command = require(`${file}`)?.command as CommandSlash;
      commands.push(command.builder.toJSON());
      this.sCommands.set(command.builder.name, command);
    }

    const rest = new REST({ version: '9' }).setToken(
      `${process.env.DISCORD_TOKEN}`
    );

    (async () => {
      try {
        console.log('[/] Started refreshing application (/) commands.');

        if (process.env.DISCORD_DEV) {
          console.log('[/] Registering guild specific commands');
          await rest.put(
            Routes.applicationGuildCommands(
              `${process.env.DISCORD_CLIENTID}`,
              `${process.env.DISCORD_GUILDID}`
            ),
            { body: commands }
          );
        } else {
          await rest.put(
            Routes.applicationCommands(`${process.env.DISCORD_CLIENTID}`),
            { body: commands }
          );
        }
        console.log('[/] Successfully reloaded application (/) commands.');
      } catch (error) {
        console.error(error);
      }
    })();
  }

  registerEvents(eventsDir: string) {
    console.log('[Events] Registering events');

    const eventFiles = fs.readdirSync(eventsDir);

    for (const file of eventFiles) {
      if (!file.endsWith('.ts')) continue;
      const event: Event = require(path.join(eventsDir, file));

      // bind event to EventEmitter
      this.on(event.name, event.run.bind(null, this));
      // console.log('[EVENTS] Loaded %s', event.name);
    }
  }

  async registerDokdo() {
    const DokdoHandler = new Dokdo(this, {
      aliases: ['d'],
      prefix: ',',
      noPerm: (message) => {
        return;
      },
    });
    const config = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../config.json'))
    );
    this.on('messageCreate', (msg) => {
      if (msg.content.startsWith(',d')) {
        if (!config.allowlistServers.includes(msg.guild.id)) return;
        else DokdoHandler.run(msg);
      }
    });
  }

  sendErrorMessage(error: Error, message: Message | CommandInteraction) {
    const diagUuid = crypto.randomUUID();
    message.reply({
      embeds: [
        errorEmbed(`An error occured trying to run this command.`, diagUuid),
      ],
    });

    const config = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../config.json'))
    );

    if (!process.env.DISCORD_ERRORWEBHOOK) {
      if (message instanceof CommandInteraction)
        return console.error(`[ERROR] An error occurred, we could not log this!
      Invoked command: ${message.commandName}
      Invoked by: ${message.user.id}
      Guild ID: ${message.guildId}
      Error UUID: ${diagUuid}
      Trace: 

      ${error.stack}
      `);

      if (message instanceof Message)
        return console.error(`[ERROR] An error occurred, we could not log this!
        Invoked command: \`${message.content}\`
        Invoked by: \`${message.author.id}\`
        Guild ID: \`${message.guildId}\`
        Error UUID: ${diagUuid}
        Trace: 

        ${error.stack}`);
    }

    const webhookClient = new WebhookClient({
      url: process.env.DISCORD_ERRORWEBHOOK,
    });

    const embed = new MessageEmbed()
      .setColor(failedEmbed)
      .setTitle('An error occured')
      .setFooter({ text: `Diagnosis code: ${diagUuid}` });

    if (message instanceof CommandInteraction)
      embed.setDescription(`**Information**
    Invoked command: \`${message.commandName}\`
    Invoked by: \`${message.user.id} (${message.user.tag})\`
    Guild ID: \`${message.guildId} (${message.guild.name})\`
    Trace: \`\`\`${error.stack}\`\`\``);

    if (message instanceof Message)
      embed.setDescription(`**Information**
    Invoked command: \`${message.content}\`
    Invoked by: \`${message.author.id} (${message.author.tag})\`
    Guild ID: \`${message.guildId} (${message.guild.name})\`
    Trace: \`\`\`${error.stack}\`\`\``);

    webhookClient.send({ content: `<@${config.owners}>`, embeds: [embed] });
  }

  sendRuntimeErrorMessage(error: Error) {
    const diagUuid = crypto.randomUUID();

    const config = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../config.json'))
    );

    const webhookClient = new WebhookClient({
      url: process.env.DISCORD_ERRORWEBHOOK,
    });

    const embed = new MessageEmbed()
      .setColor(failedEmbed)
      .setTitle('A run-time error occured')
      .setDescription(`\`\`\`${error.stack}\`\`\``)
      .setFooter({ text: `Diagnosis code: ${diagUuid}` });

    webhookClient.send({ content: `<@${config.owners}>`, embeds: [embed] });
  }
}
