require('dotenv').config();

import Client from '../structures/Client';
import Event from '../structures/Event';
import mongo from '../util/mongo';

const ready = async (client: Client) => {
  console.log('[Bot] Ready as "%s"', client.user?.tag);
  client.user.setActivity({
    name: `${client.guilds.cache.size} servers | ${client.prefix}help`,
    type: 'WATCHING',
  });
  await mongo().then((m) => {
    try {
      console.log('[Database] Connected.');
    } finally {
      m.connection.close();
    }
  });
};

const ReadyEvent: Event = {
  name: 'ready',
  run: ready,
};

module.exports = ReadyEvent;
