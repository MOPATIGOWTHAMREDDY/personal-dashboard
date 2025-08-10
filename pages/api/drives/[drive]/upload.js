import formidable from 'formidable';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  const { drive } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ multiples: true });
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    try {
      const file = files.file;
      const folderId = fields.folder_id || 'root';

      // For now, just return success
      // Implement actual upload logic for each drive
      res.json({ 
        success: true, 
        message: `File uploaded to ${drive}`,
        file: {
          id: Date.now(),
          name: file.originalFilename,
          size: file.size
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
}
