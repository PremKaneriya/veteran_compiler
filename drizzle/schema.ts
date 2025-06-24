import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const codeSnippets = pgTable('code_snippets', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  code: text('code').notNull(),
  output: text('output'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type CodeSnippet = typeof codeSnippets.$inferSelect;
export type NewCodeSnippet = typeof codeSnippets.$inferInsert;