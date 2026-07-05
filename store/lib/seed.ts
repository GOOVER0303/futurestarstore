import initSqlJs from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import * as schema from "./db-schema";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

const DB_PATH = path.join(__dirname, "..", "data", "store.db");

async function seed() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const SQL = await initSqlJs();
  const sqlDb = new SQL.Database();
  const db = drizzle(sqlDb, { schema });

  // Create tables
  sqlDb.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL
  )`);
  sqlDb.run(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, sort_order INTEGER NOT NULL DEFAULT 0
  )`);
  sqlDb.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', price REAL NOT NULL,
    images TEXT NOT NULL DEFAULT '[]', sizes TEXT NOT NULL DEFAULT '[]', stock TEXT NOT NULL DEFAULT '{}',
    category_id TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`);
  sqlDb.run(`CREATE TABLE IF NOT EXISTS custom_field_definitions (
    id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, label TEXT NOT NULL,
    type TEXT NOT NULL, options TEXT DEFAULT '[]', required INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1
  )`);
  sqlDb.run(`CREATE TABLE IF NOT EXISTS product_custom_field_values (
    id TEXT PRIMARY KEY, product_id TEXT NOT NULL, field_definition_id TEXT NOT NULL, value TEXT NOT NULL
  )`);
  sqlDb.run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, order_num TEXT NOT NULL UNIQUE, customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL, customer_address TEXT NOT NULL, customer_note TEXT NOT NULL DEFAULT '',
    total_amount REAL NOT NULL, payment_method TEXT NOT NULL, payment_status TEXT NOT NULL DEFAULT 'pending',
    order_status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL
  )`);
  sqlDb.run(`CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY, order_id TEXT NOT NULL, product_id TEXT NOT NULL,
    product_title TEXT NOT NULL, quantity INTEGER NOT NULL, size TEXT NOT NULL, unit_price REAL NOT NULL
  )`);

  // Admin user
  const pwHash = bcrypt.hashSync("admin123", 10);
  db.insert(schema.users).values({ id: uuidv4(), username: "admin", passwordHash: pwHash, createdAt: new Date().toISOString() }).run();

  // Categories
  const cat1 = uuidv4(); const cat2 = uuidv4(); const cat3 = uuidv4(); const cat4 = uuidv4();
  db.insert(schema.categories).values({ id: cat1, name: "上衣", slug: "tops", sortOrder: 0 }).run();
  db.insert(schema.categories).values({ id: cat2, name: "裤装", slug: "pants", sortOrder: 1 }).run();
  db.insert(schema.categories).values({ id: cat3, name: "裙装", slug: "dresses", sortOrder: 2 }).run();
  db.insert(schema.categories).values({ id: cat4, name: "外套", slug: "outerwear", sortOrder: 3 }).run();

  // Custom fields
  const cf1 = uuidv4(); const cf2 = uuidv4(); const cf3 = uuidv4();
  db.insert(schema.customFieldDefinitions).values({ id: cf1, name: "material", label: "材质", type: "select", options: JSON.stringify(["棉","麻","丝绸","涤纶","羊毛","牛仔"]), required: false, sortOrder: 0, isActive: true }).run();
  db.insert(schema.customFieldDefinitions).values({ id: cf2, name: "season", label: "适用季节", type: "select", options: JSON.stringify(["春","夏","秋","冬","四季"]), required: false, sortOrder: 1, isActive: true }).run();
  db.insert(schema.customFieldDefinitions).values({ id: cf3, name: "care", label: "洗涤建议", type: "textarea", options: "[]", required: false, sortOrder: 2, isActive: true }).run();

  // Sample products
  const now = new Date().toISOString();
  const p1 = uuidv4();
  db.insert(schema.products).values({
    id: p1, title: "简约纯棉T恤", description: "百搭基础款纯棉T恤，透气舒适，多色可选",
    price: 89, images: JSON.stringify([]), sizes: JSON.stringify(["S","M","L","XL"]),
    stock: JSON.stringify({S:15,M:20,L:18,XL:10}), categoryId: cat1, isActive: true, createdAt: now, updatedAt: now,
  }).run();
  db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p1, fieldDefinitionId: cf1, value: "棉" }).run();
  db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p1, fieldDefinitionId: cf2, value: "夏" }).run();
  db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p1, fieldDefinitionId: cf3, value: "建议手洗，不可漂白" }).run();

  const p2 = uuidv4();
  db.insert(schema.products).values({
    id: p2, title: "高腰直筒牛仔裤", description: "显瘦高腰设计，经典直筒版型",
    price: 199, images: JSON.stringify([]), sizes: JSON.stringify(["26","27","28","29","30"]),
    stock: JSON.stringify({"26":5,"27":8,"28":12,"29":10,"30":6}), categoryId: cat2, isActive: true, createdAt: now, updatedAt: now,
  }).run();
  db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p2, fieldDefinitionId: cf1, value: "牛仔" }).run();
  db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p2, fieldDefinitionId: cf2, value: "四季" }).run();

  const p3 = uuidv4();
  db.insert(schema.products).values({
    id: p3, title: "碎花连衣裙", description: "清新碎花图案，收腰A字裙摆，约会出游必备",
    price: 159, images: JSON.stringify([]), sizes: JSON.stringify(["S","M","L"]),
    stock: JSON.stringify({S:8,M:12,L:6}), categoryId: cat3, isActive: true, createdAt: now, updatedAt: now,
  }).run();
  db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p3, fieldDefinitionId: cf1, value: "丝绸" }).run();
  db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p3, fieldDefinitionId: cf2, value: "春" }).run();
  db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p3, fieldDefinitionId: cf3, value: "建议干洗" }).run();

  const p4 = uuidv4();
  db.insert(schema.products).values({
    id: p4, title: "轻薄风衣外套", description: "春季百搭风衣，轻薄面料，可系带收腰",
    price: 289, images: JSON.stringify([]), sizes: JSON.stringify(["M","L","XL"]),
    stock: JSON.stringify({M:10,L:8,XL:5}), categoryId: cat4, isActive: true, createdAt: now, updatedAt: now,
  }).run();
  db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p4, fieldDefinitionId: cf1, value: "涤纶" }).run();
  db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p4, fieldDefinitionId: cf2, value: "春" }).run();
  db.insert(schema.productCustomValues).values({ id: uuidv4(), productId: p4, fieldDefinitionId: cf3, value: "可机洗，低温熨烫" }).run();

  const data = sqlDb.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  console.log("✅ 数据库初始化完成！");
  console.log("   管理员: admin / admin123");
  console.log("   分类: 上衣 / 裤装 / 裙装 / 外套");
  console.log("   自定义字段: 材质 / 适用季节 / 洗涤建议");
  console.log("   示例商品: 4件");
  sqlDb.close();
}

seed().catch(console.error);
