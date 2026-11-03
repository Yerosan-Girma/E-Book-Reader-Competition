const { z } = require('zod');

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(72),
});

const updateProfileSchema = z.object({
  display_name: z.string().trim().min(1).max(100).optional(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  avatar_url: z.string().trim().optional().nullable(),
  profile_public: z.boolean().optional(),
});

module.exports = {
  changePasswordSchema,
  updateProfileSchema,
};
