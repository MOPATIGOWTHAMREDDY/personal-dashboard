export default async function handler(req, res) {
  const { file_code } = req.query;
  
  if (!file_code) {
    return res.status(400).json({ error: 'File code required' });
  }

  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Get file info from your DDownload API
    const fileInfoResponse = await fetch(`${process.env.DDOWNLOAD_API_URL || 'https://ddownload.com/api'}/file/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FileManager/1.0'
      },
      body: JSON.stringify({
        key: process.env.DDOWNLOAD_API_KEY,
        file_code: file_code
      })
    });

    if (!fileInfoResponse.ok) {
      throw new Error(`API responded with ${fileInfoResponse.status}`);
    }

    const fileData = await fileInfoResponse.json();
    
    if (fileData.status === 200 && fileData.result?.download_url) {
      // Redirect to the actual download URL
      res.redirect(fileData.result.download_url);
      return;
    }
    
    res.status(404).json({ error: 'File not found' });
    
  } catch (error) {
    console.error('Preview API error:', error);
    res.status(500).json({ error: 'Failed to get preview' });
  }
}
