export default async function handler(req, res) {
  const { folder_id = 0 } = req.query;
  
  try {
    const response = await fetch(`https://api-v2.ddownload.com/api/folder/list?key=${process.env.DDOWNLOAD_API_KEY}&fld_id=${folder_id}`, {
      method: 'GET',
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
    console.error('Files list API error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
}
