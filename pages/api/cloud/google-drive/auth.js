import { google } from 'googleapis';

export default async function handler(req, res) {
  console.log('🔍 OAuth API called:', req.method, req.body);
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
  );

  if (req.method === 'GET') {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',        // ✅ Request offline access
      prompt: 'consent',             // ✅ Force consent screen
      scope: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    });
    
    console.log('✅ Auth URL generated with offline access:', authUrl);
    res.status(200).json({ authUrl });
    
  } else if (req.method === 'POST') {
    const { code } = req.body;
    console.log('🔍 Code received for exchange:', code ? 'YES' : 'NO');
    
    if (!code) {
      console.error('❌ No authorization code provided');
      return res.status(400).json({ error: 'No authorization code provided' });
    }
    
    try {
      console.log('🔍 Attempting token exchange with offline access...');
      const { tokens } = await oauth2Client.getToken(code);
      console.log('✅ Tokens received:', {
        access_token: tokens.access_token ? 'YES' : 'NO',
        refresh_token: tokens.refresh_token ? 'YES' : 'NO',
        expires_in: tokens.expiry_date
      });
      
      res.status(200).json({ tokens });
    } catch (error) {
      console.error('❌ Token exchange failed:', error.message);
      res.status(500).json({ 
        error: 'Token exchange failed', 
        details: error.message 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
