const { neon } = require("@neondatabase/serverless");
const s = neon(process.env.DIRECT_URL);
(async () => {
  try {
    const r = await s`SELECT 1 as test`;
    console.log("OK:", JSON.stringify(r));
  } catch(e) {
    console.log("FAIL:", e.message);
  }
})();