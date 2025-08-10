export default async function handler(req, res) {
  // Invalidate session/token for the drive
  res.json({ success: true });
}