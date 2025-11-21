// api/row.js — get one row (GET) and update row (PATCH)
const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const BASEROW_TOKEN = process.env.BASEROW_TOKEN;
  const TABLE_ID = 745937;
  const { id } = req.query;
  const base = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/${id}`;

  // Manually read body for PATCH
  let payload = null;
  if (req.method === "PATCH") {
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

  // ---------- GET: fetch one row ----------
  if (req.method === "GET") {
    const resp = await fetch(base + "/?user_field_names=true", {
      headers: { Authorization: "Token " + BASEROW_TOKEN }
    });

    const data = await resp.json();
    return res.status(resp.status).json(data);
  }

  // ---------- PATCH: update row ----------
  if (req.method === "PATCH") {
    const resp = await fetch(base + "/", {
      method: "PATCH",
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
