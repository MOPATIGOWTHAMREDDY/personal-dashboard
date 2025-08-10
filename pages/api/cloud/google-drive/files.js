import { google } from 'googleapis';
import multer from 'multer';
import { Readable } from 'stream';

const upload = multer();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const accessToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!accessToken) {
    return res.status(401).json({ error: 'No access token provided' });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  if (req.method === 'GET') {
    // List files
    try {
      const response = await drive.files.list({
        pageSize: 50,
        fields: 'nextPageToken, files(id, name, size, createdTime, mimeType, webViewLink, webContentLink)'
      });

      const files = response.data.files.map(file => ({
        id: file.id,
        name: file.name,
        size: parseInt(file.size) || 0,
        createdTime: file.createdTime,
        mimeType: file.mimeType,
        downloadUrl: file.webContentLink,
        viewUrl: file.webViewLink,
        provider: 'google_drive'
      }));

      res.status(200).json({
        status: 200,
        provider: 'google_drive',
        files: files
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch Google Drive files' });
    }
  } else if (req.method === 'POST') {
    // Upload file
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: 'Upload error' });
      }

      try {
        const fileMetadata = {
          name: req.file.originalname,
        };

        const media = {
          mimeType: req.file.mimetype,
          body: Readable.from(req.file.buffer),
        };

        const response = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id, name, size, createdTime'
        });

        res.status(200).json({
          status: 200,
          provider: 'google_drive',
          file: response.data
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to upload to Google Drive' });
      }
    });
  } else if (req.method === 'DELETE') {
    // Delete file
    const { fileId } = req.query;
    
    try {
      await drive.files.delete({ fileId });
      res.status(200).json({ status: 200, message: 'File deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete file' });
    }
  }
}
