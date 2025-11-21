// upload.js — upload file to Baserow
export const config = {
  api: { bodyParser: false } // Required for file uploads
};

import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

export default async function handler(req, res) {
  const BASEROW_TOKEN = process.env.BASEROW_TOKEN;

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // Parse multipart file upload
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: err });

    const file = files.file;
    if (!file) return res.status(400).json({ error: "Missing file upload" });

    // Send file to Baserow
    const fd = new FormData();
    fd.append(
      "file",
      fs.createReadStream(file.filepath),
      file.originalFilename
    );

    const uploadResp = await fetch(
      "https://api.baserow.io/api/user-files/upload-file/",
      {
        method: "POST",
        headers: { Authorization: "Token " + BASEROW_TOKEN },
        body: fd
      }
    );

    const data = await uploadResp.json();
    return res.status(uploadResp.status).json(data);
  });
}
