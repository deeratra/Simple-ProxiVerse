import zod from 'zod';

export const SignUpSchema = zod.object({
  username: zod.string().min(3),
  password: zod.string().min(6),
  role: zod.enum(['user', 'admin']),
});

export const SignInSchema = zod.object({
  username: zod.string().min(3),
  password: zod.string().min(6),
});
