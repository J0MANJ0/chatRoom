import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const userAuth = async (req, res, next) => {
  try {
    const {
      cookies: { jwtoken: token },
    } = req;

    if (!token) {
      return res.status(401).json({
        success: true,
        message: 'Not authorized',
      });
    }

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (!tokenDecode) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const user = await User.findById(tokenDecode.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
