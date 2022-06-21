import Client from '../structures/Client';
import Event from '../structures/Event';

import { MessageReaction, User } from 'discord.js';

const messageReactionAdd = async (reaction: MessageReaction, user: User) => {
  return;
};

const MessageReactionAddEvent: Event = {
  name: 'messageReactionAdd',
  run: messageReactionAdd,
};

module.exports = MessageReactionAddEvent;
