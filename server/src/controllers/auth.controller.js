import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';
import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';

export const signup = async (req, res) => {
  try {
    const {
      body: { fullName, email, password },
    } = req;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be atleast 6 characters',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (user) {
      generateToken(user._id, res);

      await user.save();

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: {
          fullName,
          email,
          profilePic: user.profilePic,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: true,
      message: 'Internal server error',
    });
  }
};

export const login = async (req, res) => {
  try {
    const {
      body: { email, password },
    } = req;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: true,
        message: 'User does not exist',
      });
    }

    const userPassword = await bcrypt.compare(password, user.password);

    if (!userPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    generateToken(user._id, res);

    return res.status(200).json({
      success: true,
      message: 'Logged In successfully',
      _id: user._id,
      email,
      fullName: user.fullName,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Oops something went wrong!',
    });
  }
};

export const logout = async (_, res) => {
  try {
    res.clearCookie('jwtoken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged Out',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      body: { profilePic },
      user: { _id: userId },
    } = req;

    if (!profilePic) {
      return res.status(400).json({
        success: false,
        message: 'Profile photo is required',
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const user = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
