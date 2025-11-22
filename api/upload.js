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

  const form = new formidable.IncomingForm({
    multiples: true,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(400).json({ error: "Form parsing failed" });
    }

    let file = files.file;

    // ✅ Sometimes formidable returns a single file
    // ✅ Sometimes an array
    if (Array.isArray(file)) {
      file = file[0];
    }

    if (!file) {
      console.error("NO FILE RECEIVED", files);
      return res.status(400).json({ error: "Missing file upload" });
    }

    const filepath =
      file.filepath ||
      file.path ||
      file._writeStream?.path ||
      null;

    if (!filepath) {
      console.error("NO FILEPATH", file);
      return res.status(500).json({ error: "File not accessible on server" });
    }

    try {
      const fd = new FormData();
      fd.append(
        "file",
        fs.createReadStream(filepath),
        file.originalFilename || file.name
      );

      const uploadResp = await fetch(
        "https://api.baserow.io/api/user-files/upload-file/",
        {
          method: "POST",
          headers: { Authorization: "Token " + BASEROW_TOKEN },
          body: fd,
        }
      );

      const data = await uploadResp.json();

      if (!uploadResp.ok) {
        console.error("Baserow upload failed:", data);
        return res.status(500).json({
          error: "Baserow upload failed",
          detail: data
        });
      }

      return res.status(200).json(data);

    } catch (e) {
      console.error("UPLOAD ERROR:", e);
      return res.status(500).json({ error: "Upload exception" });
    }
  });
};
