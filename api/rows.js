// rows.js — list rows, create rows
const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const BASEROW_TOKEN = process.env.BASEROW_TOKEN;
  const TABLE_ID = 745937;

  // Parse POST body manually (Vercel does NOT auto-parse JSON)
  if (req.method === "POST") {
    const buffers = [];
    for await (const chunk of req) buffers.push(chunk);
    req.body = Buffer.concat(buffers).toString();
  }

  const base = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}`;

  // ------------------------------
  // GET → list rows
  // ------------------------------
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

  // ------------------------------
  // POST → create new row
  // ------------------------------
  if (req.method === "POST") {
    let payload = req.body;

    if (typeof payload === "string") {
      try { payload = JSON.parse(payload); } catch {}
    }

    const resp = await fetch(base + "/", {
      method: "POST",
      headers: {
        Authorization: `Token ${BASEROW_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    return res.status(resp.status).json(data);
  }

  return res.status(405).send("Method Not Allowed");
};
