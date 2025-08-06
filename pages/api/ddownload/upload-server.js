export default async function handler(req, res) {
  const apiKey = process.env.DDOWNLOAD_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  try {
    const response = await fetch(`https://api-v2.ddownload.com/api/upload/server?key=${apiKey}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('DDownload Upload Server Error:', error);
    res.status(500).json({ error: 'Failed to get upload server' });
  }
}
