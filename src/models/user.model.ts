import mongoose, { model, Schema } from "mongoose";

export interface IUser {
  text: string;
  imageUrl: string;
  isDeleted: boolean;
}

const messageSchema = new Schema<IUser>({
  text: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
  },
});

const userModel = () => {
  return mongoose.models && mongoose.models.User
    ? mongoose.models.User
    : model<IUser>("User", messageSchema);
};

export default userModel;
