import mongoose, { Model, model, ObjectId, Schema } from "mongoose";

export interface Message {
  text: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  _id: ObjectId;
}

const messageSchema = new Schema<Message>(
  {
    text: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const messageModel = (): Model<Message> => {
  return mongoose.models && mongoose.models.Message
    ? mongoose.models.Message
    : model<Message>("Message", messageSchema);
};

export default messageModel;
