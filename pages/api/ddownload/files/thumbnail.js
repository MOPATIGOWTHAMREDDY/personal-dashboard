export default async function handler(req, res) {
  const { file_code } = req.query;
  
  if (!file_code) {
    return res.status(400).json({ error: 'File code required' });
  }

  try {
    // Get file info using the correct DDownload API
    const fileInfoResponse = await fetch(`https://api-v2.ddownload.com/api/file/info?key=${process.env.DDOWNLOAD_API_KEY}&file_code=${file_code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FileManager/1.0'
      }
    });

    if (!fileInfoResponse.ok) {
      throw new Error(`API responded with ${fileInfoResponse.status}`);
    }

    const fileData = await fileInfoResponse.json();
    console.log('File info response:', fileData); // Debug log
    
    if (fileData.status === 200 && fileData.result && Array.isArray(fileData.result)) {
      // Find the file in the result array
      const fileInfo = fileData.result.find(file => file.filecode === file_code && file.status === 200);
      
      if (fileInfo && isImageFile(fileInfo.name)) {
        // Redirect to the download link for images
        const downloadUrl = `https://ddownload.com/${file_code}`;
        
        // Set proper headers for images
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        
        res.redirect(downloadUrl);
        return;
      }
    }
    
    // Fallback placeholder
    res.redirect('https://via.placeholder.com/200x150/374151/9CA3AF?text=No+Preview');
    
  } catch (error) {
    console.error('Thumbnail API error:', error);
    res.redirect('https://via.placeholder.com/200x150/374151/9CA3AF?text=Error');
  }
}

// Helper function to check if file is an image
function isImageFile(filename) {
  if (!filename) return false;
  const ext = filename.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'].includes(ext);
}
