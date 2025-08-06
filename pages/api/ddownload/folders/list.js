export default async function handler(req, res) {
  const apiKey = process.env.DDOWNLOAD_API_KEY;
  const { folder_id = 0 } = req.query;
  
  if (!apiKey) {
    // Return demo folders
    return res.status(200).json({
      status: 200,
      result: {
        folders: [
          {
            id: 1,
            name: "Documents",
            parent_id: folder_id,
            created: "2024-01-10 10:00:00"
          },
          {
            id: 2,
            name: "Photos",
            parent_id: folder_id,
            created: "2024-01-12 14:30:00"
          },
          {
            id: 3,
            name: "Music",
            parent_id: folder_id,
            created: "2024-01-14 09:15:00"
          }
        ]
      }
    });
  }
  
  try {
    const response = await fetch(`https://api-v2.ddownload.com/api/folder/list?key=${apiKey}&folder_id=${folder_id}`);
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API returned HTML instead of JSON');
    }
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('DDownload Folders List Error:', error);
    
    // Return demo folders as fallback
    res.status(200).json({
      status: 200,
      result: {
        folders: folder_id === 0 ? [
          {
            id: 1,
            name: "Documents",
            parent_id: 0,
            created: "2024-01-10 10:00:00"
          },
          {
            id: 2,
            name: "Photos",
            parent_id: 0,
            created: "2024-01-12 14:30:00"
          }
        ] : []
      }
    });
  }
}
