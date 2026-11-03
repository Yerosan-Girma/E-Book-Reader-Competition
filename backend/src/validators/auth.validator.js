const { z } = require('zod');

const password = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(72);

const registerSchema = z.object({
  username:    z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  email:       z.string().email(),
  password,
  displayName: z.string().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

module.exports = { registerSchema, loginSchema };