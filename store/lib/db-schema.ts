import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull(),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  price: real("price").notNull(),
  images: text("images", { mode: "json" }).$type<string[]>().notNull().default([]),
  sizes: text("sizes", { mode: "json" }).$type<string[]>().notNull().default([]),
  stock: text("stock", { mode: "json" }).$type<Record<string, number>>().notNull().default({}),
  categoryId: text("category_id").references(() => categories.id),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const customFieldDefinitions = sqliteTable("custom_field_definitions", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  label: text("label").notNull(),
  type: text("type").$type<"text" | "number" | "select" | "textarea" | "boolean">().notNull(),
  options: text("options", { mode: "json" }).$type<string[]>().default([]),
  required: integer("required", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const productCustomValues = sqliteTable("product_custom_field_values", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  fieldDefinitionId: text("field_definition_id").notNull().references(() => customFieldDefinitions.id, { onDelete: "cascade" }),
  value: text("value").notNull(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNum: text("order_num").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  customerNote: text("customer_note").notNull().default(""),
  totalAmount: real("total_amount").notNull(),
  paymentMethod: text("payment_method").$type<"online" | "offline">().notNull(),
  paymentStatus: text("payment_status").$type<"pending" | "paid" | "failed">().notNull().default("pending"),
  orderStatus: text("order_status").$type<"new" | "confirmed" | "shipped" | "completed" | "cancelled">().notNull().default("new"),
  createdAt: text("created_at").notNull(),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  productTitle: text("product_title").notNull(),
  quantity: integer("quantity").notNull(),
  size: text("size").notNull(),
  unitPrice: real("unit_price").notNull(),
});
