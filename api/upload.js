export const config = {
  api: {
    bodyParser: false,
  },
};

const { IncomingForm } = require("formidable");
const FormData = require("form-data");
const fetch = require("node-fetch");
const fs = require("fs");

module.exports = async function handler(req, res) {
  const BASEROW_TOKEN = process.env.BASEROW_TOKEN;

  const form = new IncomingForm({
    multiples: false,
    keepExtensions: true,
    fileWriteStreamHandler: () => null   // ✅ do NOT write to disk
  });

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
      const buffer = await file.toBuffer();   // ✅ get file in memory

      const fd = new FormData();
      fd.append("file", buffer, file.originalFilename);

      const uploadResp = await fetch(
        "https://api.baserow.io/api/user-files/upload-file/",
        {
          method: "POST",
          headers: {
            Authorization: "Token " + BASEROW_TOKEN
          },
          body: fd,
        }
      );

      const data = await uploadResp.json();

      if (!uploadResp.ok) {
        console.error("Baserow upload failed:", data);
        return res.status(500).json({ error: "Baserow upload failed", detail: data });
      }

      return res.status(200).json(data);

    } catch (e) {
      console.error("UPLOAD ERROR:", e);
      return res.status(500).json({ error: "Upload exception" });
    }
  });
};
