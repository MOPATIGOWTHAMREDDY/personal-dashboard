export default async function handler(req, res) {
  const { email, password } = req.body;
  // Replace this with real API call!
  if (email && password) {
    // Save a session token, etc.
    // For demo: Set a cookie or store in-memory
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Missing credentials" });
  }
}