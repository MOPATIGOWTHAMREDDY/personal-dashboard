export default async function handler(req, res) {
  const apiKey = process.env.DDOWNLOAD_API_KEY;
  
  if (!apiKey) {
    // Return demo data if no API key
    return res.status(200).json({
      status: 200,
      result: {
        storage_left: "10 GB",
        premium_traffic_left: 102400,
        email: "demo@example.com",
        premium_expire: "2025-12-31 18:00:00",
        balance: "100",
        traffic_used: "2.3 GB",
        traffic_left: "12 GB",
        storage_used: "2.3 GB"
      }
    });
  }
  
  try {
    const response = await fetch(`https://api-v2.ddownload.com/api/account/info?key=${apiKey}`);
    
    // Check if response is HTML (error page)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API returned HTML instead of JSON');
    }
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('DDownload API Error:', error);
    
    // Return demo data as fallback
    res.status(200).json({
      status: 200,
      result: {
        storage_left: "10 GB",
        premium_traffic_left: 102400,
        email: "demo@example.com",
        premium_expire: "2025-12-31 18:00:00",
        balance: "100",
        traffic_used: "2.3 GB",
        traffic_left: "12 GB",
        storage_used: "2.3 GB"
      }
    });
  }
}
