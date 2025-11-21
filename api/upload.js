export const config = {
  api: { bodyParser: false }
};

import formidable from "formidable";

export default async function handler(req, res) {
  const BASEROW_TOKEN = process.env.BASEROW_TOKEN;

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: err });

    const file = files.file;

    const uploadResp = await fetch("https://api.baserow.io/api/user-files/upload-file/", {
      method: "POST",
      headers: { Authorization: "Token " + BASEROW_TOKEN },
      body: file ? fileToForm(file) : null
    });

    const data = await uploadResp.json();
    return res.status(uploadResp.status).json(data);
  });
}

function fileToForm(file) {
  const form = new FormData();
  form.append("file", fs.createReadStream(file.filepath), file.originalFilename);
  return form;
}
