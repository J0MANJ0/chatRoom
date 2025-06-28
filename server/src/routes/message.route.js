import express from 'express';
import { userAuth } from '../middleware/userAuth.js';
import {
  getMessages,
  getUsers,
  sendMessages,
} from '../controllers/message.controller.js';

const messageRouter = express.Router();

messageRouter.get('/users', userAuth, getUsers);
messageRouter.get('/:id', userAuth, getMessages);

messageRouter.post('/send/:id', userAuth, sendMessages);

export default messageRouter;
