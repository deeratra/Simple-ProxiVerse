import { Router } from 'express';
import client from '@repo/db/client';
import { userMiddleware } from '../middleware/user';
import { MapsSchema } from '../zod/maps';
export const mapsRouter = Router();

mapsRouter.get('/', userMiddleware, async (req, res) => {
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

mapsRouter.post('/', userMiddleware, async (req, res) => {
    const parsedData = MapsSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log('error', parsedData.error);
        res.status(400).json(parsedData.error);
        return;
    }
    try{
        const map = await client.map.create({
            data: {
                name: parsedData.data.name,
                creatorId: res.locals.adminId,
                width: parseInt(parsedData.data.dimensions.split('x')[0] || '0'),
                height: parseInt(parsedData.data.dimensions.split('x')[1] || '0'),
            }
        });
        res.json(map.id);
    }
    catch (e) {
        console.log('error', e);
        res.status(400).json({
            message: e,
        });
    }

});
