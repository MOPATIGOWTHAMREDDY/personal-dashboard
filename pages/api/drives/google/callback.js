import { google } from 'googleapis';

export default async function handler(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    // Store tokens securely (session, cookie, DB)
    res.setHeader('Content-Type', 'text/html');
    res.end(`
      <html>
        <body>
          <script>
            window.opener.postMessage('authSuccess', window.opener.location.origin);
            window.close();
          </script>
          <p>Authenticated! You can close this window.</p>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}