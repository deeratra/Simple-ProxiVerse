import zod from 'zod';

export const MapsSchema = zod.object({
  name: zod.string().min(3),
  dimensions: zod.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
});

export const AddElementToMap = zod.object({
  elementId: zod.string(),
  x: zod.number().min(1).max(100),
  y: zod.number().min(1).max(100),
  mapId: zod.string(),
});
