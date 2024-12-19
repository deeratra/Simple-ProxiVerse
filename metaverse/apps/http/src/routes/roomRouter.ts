import { Router } from 'express';
import client from '@repo/db/client';
import { userMiddleware } from '../middleware/user';
import { RoomSchema } from '../zod/room';
export const roomRouter = Router();

roomRouter.get('/', userMiddleware, async (req, res) => {
  try {
    const room = await client.room.findUnique({
      where: {
        id: res.locals.userId,
      },
    });
    res.json(room);
  } catch (e) {
    console.log('error', e);
    res.status(400).json({
      message: e,
    });
  }
});

roomRouter.post('/', userMiddleware, async (req, res) => {
  const parsedData = RoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log('error', parsedData.error);
    res.status(400).json(parsedData.error);
    return;
  }
  const room = await client.room.create({
    data: {
      name: parsedData.data.name,
      mapId: parsedData.data.mapId,
      creatorId: res.locals.userId,
    },
  });
});
