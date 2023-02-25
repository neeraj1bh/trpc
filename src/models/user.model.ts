import mongoose, { model, Schema } from "mongoose";

export interface IUser {
  name: string;
  text: string;
  imageUrl: string;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

const userModel = () => {
  return mongoose.models && mongoose.models.User
    ? mongoose.models.User
    : model<IUser>("User", userSchema);
};

export default userModel;
