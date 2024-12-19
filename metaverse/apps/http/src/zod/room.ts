import zod from 'zod';

export const RoomSchema = zod.object({
  name: zod.string().min(3),
  mapId: zod.string(),
});
