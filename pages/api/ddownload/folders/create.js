export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const apiKey = process.env.DDOWNLOAD_API_KEY;
  const { name, parent_id = 0 } = req.body;
  
  if (!apiKey || !name) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  try {
    const response = await fetch(`https://api-v2.ddownload.com/api/folder/create?key=${apiKey}&name=${encodeURIComponent(name)}&parent_id=${parent_id}`, {
      method: 'POST'
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('DDownload Create Folder Error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
}
