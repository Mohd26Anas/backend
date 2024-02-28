import mongoose from "mongoose";
import { DB_name } from "../constants.js";

export const connectDb = async () => {
  try {
    const connectionString = `${process.env.MONGODB_URI}/${DB_name}`;

    const connection = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`Connected to MongoDB on host ${connection.connection.host}`);

    return connection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};
