export const handleApiResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  // Check if response is HTML (error page)
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned HTML error page instead of JSON');
  }
  
  // Check if response is ok
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Invalid JSON response from server');
  }
};

export const createDemoResponse = (type, options = {}) => {
  switch (type) {
    case 'account-info':
      return {
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
      };
    
    case 'files-list':
      return {
        status: 200,
        result: {
          files: [
            {
              file_code: "demo1",
              filename: "vacation-photos.zip",
              size: 15728640,
              uploaded: "2024-01-15 10:30:00",
              downloads: 12,
              folder_id: options.folder_id || 0
            },
            {
              file_code: "demo2",
              filename: "presentation.pdf",
              size: 2097152,
              uploaded: "2024-01-10 14:20:00",
              downloads: 5,
              folder_id: options.folder_id || 0
            }
          ]
        }
      };
    
    case 'folders-list':
      return {
        status: 200,
        result: {
          folders: options.folder_id === 0 ? [
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
      };
    
    default:
      return { status: 200, result: {} };
  }
};
