import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('adminMiddleware');
  const header = req.headers['authorization'];
  const token = header?.split(' ')[1];

  if (!token) {
    res.status(403).json({
      message: 'Unauthorized',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
      role: string;
      userId: string;
    };
    console.log('decoded', decoded);
    if (decoded.role !== 'ADMIN') {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }
    res.locals.userId = decoded.userId;
    next();
  } catch (e) {
    console.log('error', e);
    res.status(403).json({
      message: 'Unauthorized',
    });
  }
};