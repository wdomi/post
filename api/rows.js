export default async function handler(req, res) {
  const BASEROW_TOKEN = process.env.BASEROW_TOKEN;
  const TABLE_ID = 745937;

  const base = "https://api.baserow.io/api/database/rows/table/" + TABLE_ID;

  if (req.method === "GET") {
    const resp = await fetch(
      base + "/?user_field_names=true&page_size=200&filters[processed__boolean]=false",
      {
        headers: { Authorization: "Token " + BASEROW_TOKEN }
      }
    );

    const data = await resp.json();
    return res.status(resp.status).json(data);
  }

  if (req.method === "POST") {
    const payload = req.body;

    const resp = await fetch(base + "/", {
      method: "POST",
      headers: {
        Authorization: "Token " + BASEROW_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    return res.status(resp.status).json(data);
  }

  res.status(405).send("Method Not Allowed");
}
