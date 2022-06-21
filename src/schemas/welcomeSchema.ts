import mongoose, { model } from 'mongoose';

// const reqString = {
//     type: String,
//     required: true
// }

const welcomeSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  channelId: { type: String, required: true },
  text: { type: String, required: true },
});

export default model<Object>('welcome-channel', welcomeSchema);
