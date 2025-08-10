// pages/api/googledrive/files.js
export default async function handler(req, res) {
  const { token } = req.query; // Pass token from frontend for now

  if (!token) return res.status(400).json({ success: false, message: "No token" });

  try {
    const gRes = await fetch(
      "https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,size,createdTime)",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await gRes.json();
    res.json({ success: true, files: data.files || [] });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
}
