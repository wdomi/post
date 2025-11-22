const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const BASEROW_TOKEN = process.env.BASEROW_TOKEN;
  const TABLE_ID = 745937;

  const base = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}`;

  // =====================================
  // GET ROWS (supports processed toggle)
  // =====================================
  if (req.method === "GET") {
    const showProcessed = req.query.processed === "true";

    let params;

    if (showProcessed) {
      // ✅ show ALL rows
      params =
        "/?user_field_names=true&page_size=200";
    } else {
      // ✅ show only unprocessed:
      // processed=false OR processed empty
      params =
        "/?user_field_names=true&page_size=200"
        + "&filter_type=OR"
        + "&filters[processed__boolean]=false"
        + "&filters[processed__empty]=true";
    }

    const resp = await fetch(base + params, {
      headers: { Authorization: "Token " + BASEROW_TOKEN }
    });

    const data = await resp.json();
    return res.status(resp.status).json(data);
  }

  // =====================================
  // CREATE ROW
  // =====================================
  if (req.method === "POST") {
    let payload = req.body;

    if (typeof payload === "string") {
      try { payload = JSON.parse(payload); } catch {}
    }

    const resp = await fetch(
      base + "/?user_field_names=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${BASEROW_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await resp.json();
    return res.status(resp.status).json(data);
  }

  return res.status(405).send("Method Not Allowed");
};
