import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./db-schema";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  const s = neon(process.env.POSTGRES_URL!);
  const db = drizzle(s, { schema });

  // Create tables
  await s`CREATE TABLE IF NOT EXISTS users (id VARCHAR(36) PRIMARY KEY, username VARCHAR(100) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, created_at VARCHAR(30) NOT NULL)`;
  await s`CREATE TABLE IF NOT EXISTS categories (id VARCHAR(36) PRIMARY KEY, name VARCHAR(100) NOT NULL, slug VARCHAR(100) NOT NULL UNIQUE, sort_order INTEGER NOT NULL DEFAULT 0)`;
  await s`CREATE TABLE IF NOT EXISTS products (id VARCHAR(36) PRIMARY KEY, title VARCHAR(200) NOT NULL, description TEXT NOT NULL DEFAULT '', price DOUBLE PRECISION NOT NULL, images JSONB DEFAULT '[]'::jsonb, sizes JSONB DEFAULT '[]'::jsonb, stock JSONB DEFAULT '{}'::jsonb, category_id VARCHAR(36), is_active BOOLEAN NOT NULL DEFAULT true, created_at VARCHAR(30) NOT NULL, updated_at VARCHAR(30) NOT NULL)`;
  await s`CREATE TABLE IF NOT EXISTS custom_field_definitions (id VARCHAR(36) PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, label VARCHAR(100) NOT NULL, type VARCHAR(20) NOT NULL, options JSONB DEFAULT '[]'::jsonb, required BOOLEAN NOT NULL DEFAULT false, sort_order INTEGER NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true)`;
  await s`CREATE TABLE IF NOT EXISTS product_custom_field_values (id VARCHAR(36) PRIMARY KEY, product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE, field_definition_id VARCHAR(36) NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE, value TEXT NOT NULL)`;
  await s`CREATE TABLE IF NOT EXISTS orders (id VARCHAR(36) PRIMARY KEY, order_num VARCHAR(50) NOT NULL UNIQUE, customer_name VARCHAR(100) NOT NULL, customer_phone VARCHAR(30) NOT NULL, customer_address TEXT NOT NULL, customer_note TEXT NOT NULL DEFAULT '', total_amount DOUBLE PRECISION NOT NULL, payment_method VARCHAR(20) NOT NULL, payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', order_status VARCHAR(20) NOT NULL DEFAULT 'new', created_at VARCHAR(30) NOT NULL)`;
  await s`CREATE TABLE IF NOT EXISTS order_items (id VARCHAR(36) PRIMARY KEY, order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE, product_id VARCHAR(36) NOT NULL, product_title VARCHAR(200) NOT NULL, quantity INTEGER NOT NULL, size VARCHAR(20) NOT NULL, unit_price DOUBLE PRECISION NOT NULL)`;
  console.log("数据表创建完成");

  // Check if already seeded
  const existing = await s`SELECT id FROM users WHERE username = 'admin' LIMIT 1`;
  if (existing.length > 0) {
    console.log("数据库已初始化，跳过种子数据");
    return;
  }

  const pwHash = bcrypt.hashSync("admin123", 10);
  await db.insert(schema.users).values({ id: uuidv4(), username: "admin", passwordHash: pwHash, createdAt: new Date().toISOString() });

  const cat1 = uuidv4(); const cat2 = uuidv4(); const cat3 = uuidv4(); const cat4 = uuidv4();
  await db.insert(schema.categories).values({ id: cat1, name: "上衣", slug: "tops", sortOrder: 0 });
  await db.insert(schema.categories).values({ id: cat2, name: "裤装", slug: "pants", sortOrder: 1 });
  await db.insert(schema.categories).values({ id: cat3, name: "裙装", slug: "dresses", sortOrder: 2 });
  await db.insert(schema.categories).values({ id: cat4, name: "外套", slug: "outerwear", sortOrder: 3 });

  const cf1 = uuidv4(); const cf2 = uuidv4(); const cf3 = uuidv4();
  await db.insert(schema.customFieldDefinitions).values({ id: cf1, name: "material", label: "材质", type: "select", options: ["棉","麻","丝绸","涤纶","羊毛","牛仔"], required: false, sortOrder: 0, isActive: true });
  await db.insert(schema.customFieldDefinitions).values({ id: cf2, name: "season", label: "适用季节", type: "select", options: ["春","夏","秋","冬","四季"], required: false, sortOrder: 1, isActive: true });
  await db.insert(schema.customFieldDefinitions).values({ id: cf3, name: "care", label: "洗涤建议", type: "textarea", options: [], required: false, sortOrder: 2, isActive: true });

  const now = new Date().toISOString();
  const p1 = uuidv4();
  await db.insert(schema.products).values({id: p1, title: "简约纯棉T恤", description: "百搭基础款纯棉T恤，透气舒适，多色可选", price: 89, images: [], sizes: ["S","M","L","XL"], stock: {S:15,M:20,L:18,XL:10}, categoryId: cat1, isActive: true, createdAt: now, updatedAt: now});
  await db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p1, fieldDefinitionId: cf1, value: "棉" });
  await db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p1, fieldDefinitionId: cf2, value: "夏" });
  await db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p1, fieldDefinitionId: cf3, value: "建议手洗，不可漂白" });

  const p2 = uuidv4();
  await db.insert(schema.products).values({id: p2, title: "高腰直筒牛仔裤", description: "显瘦高腰设计，经典直筒版型", price: 199, images: [], sizes: ["26","27","28","29","30"], stock: {"26":5,"27":8,"28":12,"29":10,"30":6}, categoryId: cat2, isActive: true, createdAt: now, updatedAt: now});
  await db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p2, fieldDefinitionId: cf1, value: "牛仔" });
  await db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p2, fieldDefinitionId: cf2, value: "四季" });

  const p3 = uuidv4();
  await db.insert(schema.products).values({id: p3, title: "碎花连衣裙", description: "清新碎花图案，收腰A字裙摆，约会出游必备", price: 159, images: [], sizes: ["S","M","L"], stock: {S:8,M:12,L:6}, categoryId: cat3, isActive: true, createdAt: now, updatedAt: now});
  await db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p3, fieldDefinitionId: cf1, value: "丝绸" });
  await db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p3, fieldDefinitionId: cf2, value: "春" });
  await db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p3, fieldDefinitionId: cf3, value: "建议干洗" });

  const p4 = uuidv4();
  await db.insert(schema.products).values({id: p4, title: "轻薄风衣外套", description: "春季百搭风衣，轻薄面料，可系带收腰", price: 289, images: [], sizes: ["M","L","XL"], stock: {M:10,L:8,XL:5}, categoryId: cat4, isActive: true, createdAt: now, updatedAt: now});
  await db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p4, fieldDefinitionId: cf1, value: "涤纶" });
  await db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p4, fieldDefinitionId: cf2, value: "春" });
  await db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p4, fieldDefinitionId: cf3, value: "可机洗，低温熨烫" });

  console.log("数据库初始化完成！");
  console.log("管理员: admin / admin123");
}

seed().catch(console.error);