// hooks/useDDownload.js
import { useState, useCallback } from 'react';

export const useDDownload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const API_KEY = process.env.REACT_APP_DDOWNLOAD_KEY || process.env.NEXT_PUBLIC_DDOWNLOAD_KEY;
  const BASE_URL = 'https://api-v2.ddownload.com/api';

  // Get account information
  const getAccountInfo = useCallback(async () => {
    if (!API_KEY) {
      setError('DDownload API key not found');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/account/info?key=${API_KEY}`);
      const data = await response.json();
      
      if (data.status === 200) {
        setAccountInfo(data.result);
        return data.result;
      } else {
        throw new Error(data.msg || 'Failed to fetch account info');
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_KEY]);

  // Get account statistics
  const getAccountStats = useCallback(async (days = 7) => {
    if (!API_KEY) {
      setError('DDownload API key not found');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/account/stats?key=${API_KEY}&last=${days}`);
      const data = await response.json();
      
      if (data.status === 200) {
        return data.result;
      } else {
        throw new Error(data.msg || 'Failed to fetch account stats');
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_KEY]);

  // Get upload server
  const getUploadServer = useCallback(async () => {
    if (!API_KEY) {
      setError('DDownload API key not found');
      return null;
    }

    try {
      const response = await fetch(`${BASE_URL}/upload/server?key=${API_KEY}`);
      const data = await response.json();
      
      if (data.status === 200) {
        return {
          uploadUrl: data.result,
          sessionId: data.sess_id
        };
      } else {
        throw new Error(data.msg || 'Failed to get upload server');
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [API_KEY]);

  // Upload file
  const uploadFile = useCallback(async (file, onProgress = null) => {
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Get upload server first
      const serverInfo = await getUploadServer();
      if (!serverInfo) {
        throw new Error('Failed to get upload server');
      }

      // Create form data
      const formData = new FormData();
      formData.append('sess_id', serverInfo.sessionId);
      formData.append('utype', 'prem');
      formData.append('file_0', file);

      // Upload file with progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
            if (onProgress) onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response[0]?.file_status === 'OK') {
              resolve({
                fileCode: response[0].file_code,
                downloadUrl: `https://ddownload.com/${response[0].file_code}`,
                fileName: file.name,
                fileSize: file.size
              });
            } else {
              reject(new Error('Upload failed'));
            }
          } catch (err) {
            reject(new Error('Invalid response format'));
          }
          setLoading(false);
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
          setLoading(false);
        });

        xhr.open('POST', serverInfo.uploadUrl);
        xhr.send(formData);
      });

    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [getUploadServer]);

  // Get file info (you'll need to implement the file info endpoint)
  const getFileInfo = useCallback(async (fileCode) => {
    // This would require the file info endpoint from the API
    // Implementation depends on the actual endpoint structure
    console.log('Getting file info for:', fileCode);
  }, [API_KEY]);

  return {
    loading,
    error,
    accountInfo,
    uploadProgress,
    getAccountInfo,
    getAccountStats,
    uploadFile,
    getFileInfo,
    // Helper function to format file size
    formatFileSize: (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    // Helper function to format storage
    formatStorage: (storage) => {
      return storage === 'inf' ? 'Unlimited' : storage;
    }
  };
};

// hooks/useFileUploader.js
import { useState } from 'react';
import { useDDownload } from './useDDownload';

export const useFileUploader = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { uploadFile, loading, error, uploadProgress } = useDDownload();

  const handleFileUpload = async (files, onSuccess = null) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const result = await uploadFile(file, (progress) => {
          console.log(`${file.name}: ${progress}%`);
        });
        
        const fileData = {
          ...result,
          uploadedAt: new Date().toISOString(),
          originalFile: file
        };

        setUploadedFiles(prev => [...prev, fileData]);
        
        if (onSuccess) onSuccess(fileData);
        return fileData;
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
        throw err;
      }
    });

    return Promise.all(uploadPromises);
  };

  const removeUploadedFile = (fileCode) => {
    setUploadedFiles(prev => prev.filter(file => file.fileCode !== fileCode));
  };

  const clearAllUploads = () => {
    setUploadedFiles([]);
  };

  return {
    uploadedFiles,
    handleFileUpload,
    removeUploadedFile,
    clearAllUploads,
    loading,
    error,
    uploadProgress
  };
};