// api/upload.js — upload file to Baserow
const formidable = require("formidable");
const fs = require("fs");
const FormData = require("form-data");
const fetch = require("node-fetch");

// Disable default body parsing so formidable can handle multipart form-data
const handler = async function (req, res) {
  const BASEROW_TOKEN = process.env.BASEROW_TOKEN;

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const form = formidable({
    multiples: false,
    uploadDir: "/tmp",      // Vercel temp dir
    keepExtensions: true
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: err });

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: "Missing file upload" });
    }

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
};

module.exports = handler;
module.exports.config = {
  api: { bodyParser: false }
};
