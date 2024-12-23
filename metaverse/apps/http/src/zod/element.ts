import zod from 'zod';

export const ElementSchema = zod.object({
  width: zod.number().int().min(1),
  height: zod.number().int().min(1),
  imageUrl: zod.string(),
});
