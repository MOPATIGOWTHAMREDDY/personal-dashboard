import { Storage } from 'megajs';

export default async function handler(req, res) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (req.method === 'GET') {
    try {
      const storage = await new Storage({
        email: email,
        password: password
      }).ready;

      const files = [];
      for (const file of storage.children) {
        if (file.directory === false) {
          files.push({
            id: file.nodeId,
            name: file.name,
            size: file.size,
            createdTime: new Date(file.timestamp * 1000).toISOString(),
            downloadUrl: await file.link(),
            provider: 'mega'
          });
        }
      }

      res.status(200).json({
        status: 200,
        provider: 'mega',
        files: files
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch MEGA files' });
    }
  } else if (req.method === 'POST') {
    // Upload file to MEGA
    try {
      const storage = await new Storage({
        email: email,
        password: password
      }).ready;

      // File upload implementation
      res.status(200).json({
        status: 200,
        message: 'Upload functionality available'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload to MEGA' });
    }
  }
}
