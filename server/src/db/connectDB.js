import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${uri}/chat_db`);

    conn
      ? console.log(`CONNECTED ON DB: chat_db,DB host ${conn.connection.host}`)
      : console.log('Error connecting DB');
  } catch (error) {
    console.error('Error connecting:', error);
    process.exit(1);
  }
};

export default connectDB;
