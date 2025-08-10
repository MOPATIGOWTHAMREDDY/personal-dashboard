// Utility functions for MEGA integration
export async function connectToMega(email, password) {
  try {
    const { Storage } = require('megajs');
    const storage = await new Storage({
      email: email,
      password: password
    }).ready;
    
    return storage;
  } catch (error) {
    throw new Error('MEGA connection failed');
  }
}

export async function getMegaFiles(storage, folderId = 'root') {
  const folder = folderId === 'root' ? storage.root : storage.find(folderId);
  
  const files = [];
  const folders = [];

  for (const item of folder.children) {
    if (item.directory) {
      folders.push({
        id: item.nodeId,
        name: item.name
      });
    } else {
      files.push({
        id: item.nodeId,
        name: item.name,
        size: item.size,
        created_at: new Date(item.timestamp * 1000),
        link: await item.link()
      });
    }
  }

  return { files, folders };
}
