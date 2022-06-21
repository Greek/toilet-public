import mongoose, { model } from 'mongoose';

// const reqString = {
//     type: String,
//     required: true
// }

const messageLogSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  channelId: { type: String, required: true },
});

export default model<Object>('message-log-channels', messageLogSchema);
