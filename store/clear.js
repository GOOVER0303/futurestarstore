const { neon } = require('@neondatabase/serverless');
const s = neon(process.env.POSTGRES_URL);
(async () => {
  await sDELETE FROM product_custom_field_values;
  await sDELETE FROM order_items;
  await sDELETE FROM orders;
  await sDELETE FROM products;
  await sDELETE FROM custom_field_definitions;
  await sDELETE FROM categories;
  await sDELETE FROM users;
  console.log('All data cleared');
})();