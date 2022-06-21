import Client from './Client';

import { Message } from 'discord.js';

export type RunCallback = (client: Client, message: Message, args: any) => void;

export default interface Command {
  name: string;
  description?: string;
  aliases?: string[];
  run: RunCallback;
}
