export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const apiKey = process.env.DDOWNLOAD_API_KEY;
  
  if (!apiKey) {
    // Return demo upload response
    return res.status(200).json({
      status: 200,
      upload_url: "https://demo-upload-server.com/upload",
      sess_id: "demo_session_" + Date.now()
    });
  }
  
  try {
    const response = await fetch(`https://api-v2.ddownload.com/api/upload/server?key=${apiKey}`);
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API returned HTML instead of JSON');
    }
    
    const data = await response.json();
    
    if (data.status === 200) {
      res.status(200).json({
        status: 200,
        upload_url: data.result,
        sess_id: data.sess_id
      });
    } else {
      throw new Error('Invalid API response');
    }
  } catch (error) {
    console.error('DDownload Upload Server Error:', error);
    
    // Return demo upload response as fallback
    res.status(200).json({
      status: 200,
      upload_url: "https://demo-upload-server.com/upload",
      sess_id: "demo_session_" + Date.now()
    });
  }
}
