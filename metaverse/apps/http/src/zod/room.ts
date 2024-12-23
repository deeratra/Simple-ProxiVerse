import zod from 'zod';

export const RoomSchema = zod.object({
  name: zod.string().min(3),
  mapId: zod.string(),
});

export const AddElementToRoom = zod.object({
  elementId: zod.string(),
  x: zod.number().min(1).max(100),
  y: zod.number().min(1).max(100),
  imageUrl: zod.string().url(),
  roomId: zod.string(),
});
