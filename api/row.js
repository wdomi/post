const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const BASEROW_TOKEN = process.env.BASEROW_TOKEN;
  const TABLE_ID = 745937;
  const { id } = req.query;

  const base = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/${id}`;

  if (req.method === "GET") {
    const resp = await fetch(base + "/?user_field_names=true", {
      headers: { Authorization: "Token " + BASEROW_TOKEN }
    });

    const data = await resp.json();
    return res.status(resp.status).json(data);
  }

  if (req.method === "PATCH") {
    let payload = req.body;

    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {}
    }

    const resp = await fetch(base + "/", {
      method: "PATCH",
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
