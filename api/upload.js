export const config = {
  api: {
    bodyParser: false,
  },
};

const { IncomingForm } = require("formidable");
const fs = require("fs");
const FormData = require("form-data");
const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const BASEROW_TOKEN = process.env.BASEROW_TOKEN;

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const form = new IncomingForm({
    multiples: false,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(400).json({ error: "Form parsing failed" });
    }

    let file = files.file;

    // ✅ Formidable v3 normalisation
    if (Array.isArray(file)) file = file[0];

    // ✅ FINAL FIX: Vercel + Formidable v3 file path
    const filepath =
      file?.filepath ||
      file?._writeStream?.path ||
      file?.file?.filepath ||
      null;

    if (!filepath) {
      console.error("NO VALID FILEPATH", file);
      return res.status(400).json({ error: "No valid file received" });
    }

    try {
      const fd = new FormData();
      fd.append(
        "file",
        fs.createReadStream(filepath),
        file.originalFilename || "upload.bin"
      );

      const headers = {
        Authorization: "Token " + BASEROW_TOKEN,
        ...fd.getHeaders()
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
        console.error("Baserow upload failed:", data);
        return res.status(500).json({ error: "Baserow upload failed", detail: data });
      }

      return res.status(200).json(data);

    } catch (e) {
      console.error("UPLOAD EXCEPTION:", e);
      return res.status(500).json({ error: "Upload exception", detail: e.toString() });
    }
  });
};
