export default function handler(req, res) {
  // For demo, always mark as connected if a cookie/session is present
  // In production, check real tokens
  res.json({
    success: true,
    drives: {
      googledrive: { connected: false }, // Set to true after OAuth
      terabox: { connected: true },      // Set to true after credentials
      mega: { connected: true },
      degoo: { connected: true }
    }
  });
}