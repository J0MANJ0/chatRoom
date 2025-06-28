import cloudinary from '../lib/cloudinary.js';
import { getReceiverSocketId, io } from '../lib/socket.js';
import Message from '../models/Message.model.js';
import User from '../models/User.model.js';

export const getUsers = async (req, res) => {
  try {
    const {
      user: { _id: loggedInUserId },
    } = req;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select('-password');

    return res.status(200).json({
      success: true,
      filteredUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const {
      params: { id: recipientId },
      user: { _id: userId },
    } = req;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: recipientId },
        { senderId: recipientId, receiverId: userId },
      ],
    });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendMessages = async (req, res) => {
  try {
    const {
      body: { text, image },
      params: { id: receiverId },
      user: { _id: senderId },
    } = req;

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const message = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await message.save();

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('message', message);
    }

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
