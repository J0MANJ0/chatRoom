import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import path from 'path';
import connectDB from './db/connectDB.js';
// routes
import authRouter from './routes/auth.route.js';
import messageRouter from './routes/message.route.js';
import { app, server } from './lib/socket.js';

const PORT = process.env.PORT;
const __dirname = path.resolve();
// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'dist', 'index.html'));
  });
}
// const token = crypto.randomBytes(32).toString('hex');

// console.log(token);

connectDB()
  .then(() => {
    server.listen(PORT, () =>
      console.log(`Server is running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log(err));
