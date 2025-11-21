// api/rows.js — list rows (GET) and create row (POST)
const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const BASEROW_TOKEN = process.env.BASEROW_TOKEN;
  const TABLE_ID = 745937;
  const base = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}`;

  // Manually read body for POST (Vercel does not auto-parse JSON)
  let payload = null;
  if (req.method === "POST") {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks).toString();
    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = raw;
      }
    }
  }

  // ---------- GET: list rows ----------
  if (req.method === "GET") {
    const url =
      base +
      "/?user_field_names=true&page_size=200&filters[processed__boolean]=false";

    const resp = await fetch(url, {
      headers: { Authorization: "Token " + BASEROW_TOKEN }
    });

    const data = await resp.json();
    return res.status(resp.status).json(data);
  }

  // ---------- POST: create new row ----------
  if (req.method === "POST") {
    const resp = await fetch(base + "/", {
      method: "POST",
      headers: {
        Authorization: `Token ${BASEROW_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload || {})
    });

    const data = await resp.json();
    return res.status(resp.status).json(data);
  }

  return res.status(405).send("Method Not Allowed");
};
