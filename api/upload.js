// api/upload.js – CommonJS version for Vercel Node runtime

const formidable = require("formidable");
const fs = require("fs");
const FormData = require("form-data");
const fetch = require("node-fetch");

// Disable the default body parser so formidable can handle multipart/form-data
async function handler(req, res) {
  const BASEROW_TOKEN = process.env.BASEROW_TOKEN;

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(400).json({ error: "Form parsing failed" });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: "Missing file upload" });
    }

    try {
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

      if (!uploadResp.ok) {
        console.error("Baserow upload failed:", data);
        return res
          .status(uploadResp.status || 500)
          .json({ error: "Baserow upload failed", detail: data });
      }

      // Baserow returns an object with `file` info etc.
      return res.status(200).json(data);
    } catch (e) {
      console.error("UPLOAD ERROR:", e);
      return res.status(500).json({ error: "Upload exception" });
    }
  });
}

module.exports = handler;
module.exports.config = {
  api: {
    bodyParser: false
  }
};
