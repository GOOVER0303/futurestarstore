const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.POSTGRES_URL);
(async () => {
  const users = await sql`SELECT id, username, password_hash FROM users`;
  console.log("Users:", JSON.stringify(users));
  const bcrypt = require("bcryptjs");
  for (const u of users) {
    const match = bcrypt.compareSync("admin123", u.password_hash);
    console.log("Match for " + u.username + ": " + match);
  }
})();