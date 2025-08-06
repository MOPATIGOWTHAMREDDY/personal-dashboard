export default async function handler(req, res) {
  const apiKey = process.env.DDOWNLOAD_API_KEY;
  const { page = 1, per_page = 50 } = req.query;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  try {
    const response = await fetch(`https://api-v2.ddownload.com/api/file/deleted?key=${apiKey}&page=${page}&per_page=${per_page}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('DDownload Deleted Files Error:', error);
    res.status(500).json({ error: 'Failed to fetch deleted files' });
  }
}
