export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const apiKey = process.env.DDOWNLOAD_API_KEY;
  const { file_code, folder_id } = req.body;
  
  if (!apiKey || !file_code) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  try {
    const response = await fetch(`https://api-v2.ddownload.com/api/file/set_folder?key=${apiKey}&file_code=${file_code}&folder_id=${folder_id || 0}`, {
      method: 'POST'
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('DDownload Set Folder Error:', error);
    res.status(500).json({ error: 'Failed to move file to folder' });
  }
}
