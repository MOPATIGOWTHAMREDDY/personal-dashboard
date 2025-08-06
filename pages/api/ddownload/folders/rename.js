export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const apiKey = process.env.DDOWNLOAD_API_KEY;
  const { folder_id, name } = req.body;
  
  if (!apiKey || !folder_id || !name) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  try {
    const response = await fetch(`https://api-v2.ddownload.com/api/folder/rename?key=${apiKey}&folder_id=${folder_id}&name=${encodeURIComponent(name)}`, {
      method: 'POST'
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('DDownload Rename Folder Error:', error);
    res.status(500).json({ error: 'Failed to rename folder' });
  }
}
