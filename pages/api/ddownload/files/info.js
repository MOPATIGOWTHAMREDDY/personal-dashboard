export default async function handler(req, res) {
  const { file_code } = req.query;
  
  if (!file_code) {
    return res.status(400).json({ error: 'File code required' });
  }

  try {
    // Use the correct API endpoint from your docs
    const response = await fetch(`https://api-v2.ddownload.com/api/file/info?key=${process.env.DDOWNLOAD_API_KEY}&file_code=${file_code}`, {
      method: 'GET', // DDownload uses GET, not POST
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FileManager/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('File info API error:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
}
