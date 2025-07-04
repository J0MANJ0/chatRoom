import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('jwtoken', token, {
    maxAge: 7 * 24 * 3600000,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.MODE === 'production',
  });

  return token;
};
