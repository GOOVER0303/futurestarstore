import { pgTable, varchar, text, integer, doublePrecision, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: varchar("created_at", { length: 30 }).notNull(),
});

export const categories = pgTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable("products", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull().default(""),
  price: doublePrecision("price").notNull(),
  images: jsonb("images").$type<string[]>().default(sql`'[]'::jsonb`),
  sizes: jsonb("sizes").$type<string[]>().default(sql`'[]'::jsonb`),
  stock: jsonb("stock").$type<Record<string, number>>().default(sql`'{}'::jsonb`),
  categoryId: varchar("category_id", { length: 36 }).references(() => categories.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: varchar("created_at", { length: 30 }).notNull(),
  updatedAt: varchar("updated_at", { length: 30 }).notNull(),
});

export const customFieldDefinitions = pgTable("custom_field_definitions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  label: varchar("label", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).$type<"text" | "number" | "select" | "textarea" | "boolean">().notNull(),
  options: jsonb("options").$type<string[]>().default(sql`'[]'::jsonb`),
  required: boolean("required").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const productCustomValues = pgTable("product_custom_field_values", {
  id: varchar("id", { length: 36 }).primaryKey(),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
  fieldDefinitionId: varchar("field_definition_id", { length: 36 }).notNull().references(() => customFieldDefinitions.id, { onDelete: "cascade" }),
  value: text("value").notNull(),
});

export const orders = pgTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderNum: varchar("order_num", { length: 50 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 100 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 30 }).notNull(),
  customerAddress: text("customer_address").notNull(),
  customerNote: text("customer_note").notNull().default(""),
  totalAmount: doublePrecision("total_amount").notNull(),
  paymentMethod: varchar("payment_method", { length: 20 }).$type<"online" | "offline">().notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).$type<"pending" | "paid" | "failed">().notNull().default("pending"),
  orderStatus: varchar("order_status", { length: 20 }).$type<"new" | "confirmed" | "shipped" | "completed" | "cancelled">().notNull().default("new"),
  createdAt: varchar("created_at", { length: 30 }).notNull(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderId: varchar("order_id", { length: 36 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 36 }).notNull(),
  productTitle: varchar("product_title", { length: 200 }).notNull(),
  quantity: integer("quantity").notNull(),
  size: varchar("size", { length: 20 }).notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
});