import { Router } from 'express';
import client from '@repo/db/client';
import jwt from 'jsonwebtoken';
import { SignInSchema, SignUpSchema } from '../zod/auth';

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export const authRouter = Router();

authRouter.post('/signin', async (req, res) => {
  const parsedData = SignInSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log('error', parsedData.error);
    res.status(400).json(parsedData.error);
    return;
  }

  try {
    const user = await client.user.findFirst({
      where: {
        username: parsedData.data.username,
      },
    });
    if (!user) {
      res.status(400).json({
        message: 'User not found',
      });
      return;
    }

    const isValid = true; // [TODO] We compare the hashed password here

    if (!isValid) {
      res.status(403).json({
        message: 'Invalid password',
      });
      return;
    }
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      JWT_SECRET,
    );

    res.json({
      token,
    });
  } catch (e) {
    console.log('error', e);
    res.status(400).json({
      message: e,
    });
  }
});

authRouter.post('/signup', async (req, res) => {
  const parsedData = SignUpSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log('error', parsedData.error);
    res.status(400).json(parsedData.error);
    return;
  }

  const hashedPassword = parsedData.data.password; // [TODO]/ We hash the password here
  try {
    const user = await client.user.create({
      data: {
        username: parsedData.data.username,
        password: hashedPassword,
        role: parsedData.data.role === 'admin' ? 'ADMIN' : 'USER',
      },
    });
    res.json({
      userId: user.id,
    });
  } catch (e) {
    console.log('error', e);
    res.status(400).json({
      message: e,
    });
  }
});
