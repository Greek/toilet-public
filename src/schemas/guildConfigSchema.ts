import mongoose, { model } from 'mongoose';

const guildConfig = new mongoose.Schema({
  _id: { type: String, required: true },
  messageLog: { type: String },
  colorsRole: { type: String },
  snipeConfig: { type: Boolean },
});

export default model<Object>('guild-config', guildConfig);
