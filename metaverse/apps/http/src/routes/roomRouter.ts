import { Router } from 'express';
import client from '@repo/db/client';
import { userMiddleware } from '../middleware/user';
import { AddElementToRoom, RoomSchema } from '../zod/room';
export const roomRouter = Router();

// Need to update the logic to get elements as well from the room
roomRouter.get('/', userMiddleware, async (req, res) => {
  try {
    const room = await client.room.findMany({
      where: {
        creatorId: res.locals.userId,
      },
      include: {
        elements: {
          include: {
            element: true,
          },
        },
      },
    });
    if (!room) {
      res.status(400).json({
        message: 'Room not found',
      });
      return;
    }
    res.json(room);
  } catch (e) {
    console.log('error', e);
    res.status(400).json({
      message: e,
    });
  }
});

roomRouter.post('/', userMiddleware, async (req, res) => {
  console.log('Creating room:', req.body);
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
  res.json(room.id);
});

roomRouter.post('/element', userMiddleware, async (req, res) => {
  const parsedData = AddElementToRoom.safeParse(req.body);
  if (!parsedData.success) {
    console.log('error', parsedData.error);
    res.status(400).json(parsedData.error);
    return;
  }
  try {
    const element = await client.roomElements.create({
      data: {
        elementId: parsedData.data.elementId,
        x: parsedData.data.x,
        y: parsedData.data.y,
        roomId: parsedData.data.roomId,
      },
    });
    res.json(element.id);
  } catch (e) {
    console.log('error', e);
    res.status(400).json({
      message: e,
    });
  }
});

roomRouter.delete('/:id', userMiddleware, async (req, res) => {
  try {
    await client.room.delete({
      where: {
        id: req.params.id,
      },
    });
    res.json('Room deleted');
  } catch (e) {
    console.log('error', e);
    res.status(400).json({
      message: e,
    });
  }
});
