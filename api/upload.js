export const config = {
  api: {
    bodyParser: false,
  },
};

const formidable = require("formidable");
const fs = require("fs");
const FormData = require("form-data");
const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
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

    // ✅ Support all formidable versions
    const filePath =
      file.filepath ||
      file.path ||
      (file._writeStream && file._writeStream.path);

    if (!filePath) {
      console.error("NO FILE PATH", file);
      return res.status(500).json({ error: "Could not read uploaded file" });
    }

    try {
      const fd = new FormData();
      fd.append(
        "file",
        fs.createReadStream(filePath),
        file.originalFilename || file.name
      );

      // ✅ CRITICAL FIX: include multipart headers
      const headers = {
        Authorization: "Token " + BASEROW_TOKEN,
        ...fd.getHeaders(),
      };

      const uploadResp = await fetch(
        "https://api.baserow.io/api/user-files/upload-file/",
        {
          method: "POST",
          headers,
          body: fd,
        }
      );

      const data = await uploadResp.json();

      if (!uploadResp.ok) {
        console.error("BASEROW UPLOAD FAILED:", data);
        return res.status(500).json({ error: "Baserow upload failed", detail: data });
      }

      return res.status(200).json(data);

    } catch (e) {
      console.error("UPLOAD EXCEPTION:", e);
      return res.status(500).json({ error: "Upload exception", detail: e.toString() });
    }
  });
};
