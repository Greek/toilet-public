import mongoose, { model } from 'mongoose';

export const tagSchema = new mongoose.Schema({
  // _id: { type: String, required: true },
  tagGuildId: { type: String, required: true },
  tagId: { type: String },
  tagContent: { type: String },
});

export default model<Object>('tags', tagSchema);
