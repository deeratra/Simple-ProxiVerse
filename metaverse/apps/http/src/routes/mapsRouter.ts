import { Router } from 'express';
import client from '@repo/db/client';
import { userMiddleware } from '../middleware/user';
import { AddElementToMap, MapsSchema } from '../zod/maps';
import { adminMiddleware } from '../middleware/admin';
export const mapsRouter = Router();

mapsRouter.get('/bulk', userMiddleware, async (req, res) => {
  try {
    const maps = await client.map.findMany();
    res.json(maps);
  } catch (e) {
    console.log('error', e);
    res.status(400).json({
      message: e,
    });
  }
});

mapsRouter.post('/', adminMiddleware, async (req, res) => {
  const parsedData = MapsSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log('error', parsedData.error);
    res.status(400).json(parsedData.error);
    return;
  }
  try {
    const map = await client.map.create({
      data: {
        name: parsedData.data.name,
        creatorId: res.locals.userId,
        width: parseInt(parsedData.data.dimensions.split('x')[0] || '0'),
        height: parseInt(parsedData.data.dimensions.split('x')[1] || '0'),
      },
    });
    res.json(map.id);
  } catch (e) {
    console.log('error', e);
    res.status(400).json({
      message: e,
    });
  }
});

mapsRouter.post('/element', adminMiddleware, async (req, res) => {
  const parsedData = AddElementToMap.safeParse(req.body);
  if (!parsedData.success) {
    console.log('error', parsedData.error);
    res.status(400).json(parsedData.error);
    return;
  }
  // Check whether the elementId and mapId exist
  const element = await client.element.findUnique({
    where: {
      id: parsedData.data.elementId,
    },
  });
  if (!element) {
    res.status(400).json({
      message: 'Element not found',
    });
    return;
  }
  const map = await client.map.findUnique({
    where: {
      id: parsedData.data.mapId,
    },
  });
  if (!map) {
    res.status(400).json({
      message: 'Map not found',
    });
    return;
  }
  try {
    const element = await client.mapElements.create({
      data: {
        elementId: parsedData.data.elementId,
        x: parsedData.data.x,
        y: parsedData.data.y,
        mapId: parsedData.data.mapId,
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

mapsRouter.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await client.map.delete({
      where: {
        id: req.params.id,
      },
    });
    res.json('ok');
  } catch (e) {
    console.log('error', e);
    res.status(400).json({
      message: e,
    });
  }
});
