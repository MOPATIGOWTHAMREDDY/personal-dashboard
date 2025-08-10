export default async function handler(req, res) {
  // Accept { email, password }
  // Use Mega API or browser automation to authenticate and store session/cookie
  res.json({ success: true });
}