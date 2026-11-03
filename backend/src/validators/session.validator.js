const { z } = require('zod');

const startSchema = z.object({
  bookId:    z.coerce.number().int().positive(),
  chapterId: z.coerce.number().int().positive().nullable().optional(),
  format:    z.string().max(50).optional(),
});

const sessionIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const bookIdParamsSchema = z.object({
  bookId: z.coerce.number().int().positive(),
});

const progressSchema = z.object({
  bookId: z.coerce.number().int().positive(),
  chapterId: z.coerce.number().int().positive().nullable().optional(),
  scrollPercent: z.coerce.number().min(0).max(100).optional(),
  format: z.string().max(50).optional(),
  position: z.union([z.string(), z.number()]).transform((v) => String(v)).optional(),
  totalUnits: z.coerce.number().min(0).optional(),
  isCompleted: z.boolean().optional(),
  bookmarks: z.array(z.object({
    id: z.union([z.string(), z.number()]),
    position: z.union([z.string(), z.number()]),
    label: z.string().optional(),
    page: z.coerce.number().optional(),
    createdAt: z.string().optional(),
  })).optional(),
});

module.exports = {
  startSchema,
  sessionIdSchema,
  bookIdParamsSchema,
  progressSchema,
};
