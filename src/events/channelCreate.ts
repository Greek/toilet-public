import Client from '../structures/Client';
import Event from '../structures/Event';

import { TextChannel } from 'discord.js';

const channelCreate = async (client: Client, channel: TextChannel) => {
  return;
};

const channelCreateEvent: Event = {
  name: 'channelCreate',
  run: channelCreate,
};

module.exports = channelCreateEvent;
