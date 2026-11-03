const { z } = require('zod');

const listBooksQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  category: z.string().trim().max(100).optional(),
  language: z.string().trim().min(2).max(50).optional(),
  format: z.string().trim().max(50).optional(),
  page: z.coerce.number().int().positive().max(1_000_000).default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

const bookIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const chapterIdParamsSchema = bookIdParamsSchema.extend({
  chapterId: z.coerce.number().int().positive(),
});

module.exports = {
  listBooksQuerySchema,
  bookIdParamsSchema,
  chapterIdParamsSchema,
};
