import mongoose from "mongoose";

export const dbConnetion = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(`error in database ${error}`);
  }
};
