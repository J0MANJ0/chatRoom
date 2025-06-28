import express from 'express';
import {
  isAuthenticated,
  login,
  logout,
  signup,
  updateProfile,
} from '../controllers/auth.controller.js';
import { userAuth } from '../middleware/userAuth.js';

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

authRouter.put('/update-profile', userAuth, updateProfile);

authRouter.get('/check', userAuth, isAuthenticated);

export default authRouter;
