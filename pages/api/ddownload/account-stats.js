export default async function handler(req, res) {
  const apiKey = process.env.DDOWNLOAD_API_KEY;
  const { last = 7 } = req.query;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  try {
    const response = await fetch(`https://api-v2.ddownload.com/api/account/stats?key=${apiKey}&last=${last}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('DDownload Stats API Error:', error);
    res.status(500).json({ error: 'Failed to fetch account stats' });
  }
}
