// pages/api/googledrive/callback.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Missing code from request' });
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return res.status(400).json({
        success: false,
        message: tokenData.error_description || 'OAuth token exchange failed',
        details: tokenData
      });
    }

    // Send token back to client (in production, store it securely instead)
    return res.status(200).json({
      success: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in
    });
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
}
