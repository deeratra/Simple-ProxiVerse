import { Router } from 'express';
import { ElementSchema } from '../zod/element';
import client from '@repo/db/client';
export const elementRouter = Router();

elementRouter.post('/', async (req, res) => {
  const parsedData = ElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log('error', parsedData.error);
    res.status(400).json(parsedData.error);
    return;
  }

  try {
    const element = await client.element.create({
      data: {
        width: parsedData.data.width,
        height: parsedData.data.height,
        imageUrl: parsedData.data.imageUrl,
        static: true,
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

elementRouter.get('/bulk', async (req, res) => {
  try {
    const elements = await client.element.findMany();
    console.log('elements', elements);
    res.json(elements);
  } catch (e) {
    console.log('error', e);
    res.status(400).json({
      message: e,
    });
  }
});

elementRouter.get('/:id', async (req, res) => {
  try {
    const element = await client.element.findUnique({
      where: {
        id: req.params.id,
      },
    });
    res.json(element);
  } catch (e) {
    console.log('error', e);
    res.status(400).json({
      message: e,
    });
  }
});


