import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const content = pgTable("content", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  year: integer("year").notNull(),
  rating: text("rating").notNull(),
  duration: text("duration"),
  seasons: integer("seasons"),
  episodes: integer("episodes"),
  genre: text("genre").notNull(),
  classification: text("classification").notNull(),
  directors: jsonb("directors"),
  creator: text("creator"),
  creatorImage: text("creator_image"),
  cast: jsonb("cast").notNull(),
  description: text("description").notNull(),
  fullDescription: text("full_description").notNull(),
  poster: text("poster").notNull(),
  backdrop: text("backdrop").notNull(),
  embed: text("embed").notNull(),
  featured: boolean("featured").default(false),
  type: text("type").notNull(), // 'movie' or 'series'
});

export const userLists = pgTable("user_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  contentId: text("content_id").references(() => content.id).notNull(),
  addedAt: text("added_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContentSchema = createInsertSchema(content);

export const insertUserListSchema = createInsertSchema(userLists).pick({
  userId: true,
  contentId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type UserList = typeof userLists.$inferSelect;
export type InsertUserList = z.infer<typeof insertUserListSchema>;
