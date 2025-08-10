// pages/api/googledrive/upload.js
export const config = {
  api: { bodyParser: false }, // allow file uploads
};

import formidable from "formidable";
import fs from "fs";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ success: false, message: err.message });

    const token = fields.token;
    if (!token) return res.status(400).json({ success: false, message: "No token" });

    const file = files.file[0];
    const fileStream = fs.createReadStream(file.filepath);

    try {
      const gRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: createMultipartBody(file, fileStream),
      });

      const data = await gRes.json();
      res.json({ success: true, file: data });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });
}

function createMultipartBody(file, stream) {
  const boundary = "boundary123";
  const metadata = {
    name: file.originalFilename,
    mimeType: file.mimetype,
  };

  let body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) + "\r\n" +
    `--${boundary}\r\nContent-Type: ${file.mimetype}\r\n\r\n`;

  return new Blob([body, stream, `\r\n--${boundary}--`], { type: `multipart/related; boundary=${boundary}` });
}
