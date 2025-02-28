import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messages: [
    {
      message: { type: String, required: true },
      senderId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
  ],
});
