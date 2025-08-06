import React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Upload, Folder, Download, BarChart3, FileText, Image, Video, Music,
  Share2, Trash2, Plus, Search, Filter, Grid, List, Cloud, HardDrive,
  RefreshCw, Link, Copy, CheckCircle, Edit3, FolderPlus, ArrowLeft,
  MoreVertical, Move, Info, Calendar, Eye, X, ChevronRight, Star, StarOff,
  SortAsc, SortDesc, Zap, Shield, Clock, Users, Tag, Archive, Activity,
  TrendingUp, FileCheck, AlertCircle, CheckSquare, Square, Play, Pause,
  Volume2, ZoomIn
} from 'lucide-react';

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(0);
  const [folderPath, setFolderPath] = useState([{ id: 0, name: 'Home' }]);
  const [uploading, setUploading] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [accountStats, setAccountStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showRename, setShowRename] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [showFileInfo, setShowFileInfo] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [showDeletedFiles, setShowDeletedFiles] = useState(false);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [showImagePreview, setShowImagePreview] = useState(null);
  
  // Advanced features state
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [favoriteFiles, setFavoriteFiles] = useState(new Set());
  const [tags, setTags] = useState({});
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateRange: 'all',
    sizeRange: 'all',
    fileType: 'all'
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const categories = [
    { id: 'all', name: 'All Files', icon: FileText, color: 'blue' },
    { id: 'images', name: 'Images', icon: Image, color: 'green' },
    { id: 'videos', name: 'Videos', icon: Video, color: 'purple' },
    { id: 'audio', name: 'Audio', icon: Music, color: 'orange' },
    { id: 'documents', name: 'Documents', icon: FileText, color: 'indigo' },
    { id: 'favorites', name: 'Favorites', icon: Star, color: 'yellow' },
  ];

  useEffect(() => {
    loadData();
  }, [currentFolder]);

  useEffect(() => {
    const savedFavorites = new Set();
    const savedTags = {};
    setFavoriteFiles(savedFavorites);
    setTags(savedTags);
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      getAccountInfo(),
      getAccountStats(),
      loadFiles(),
      loadFolders(),
      loadAnalytics()
    ]);
    setLoading(false);
  };

  const getAccountInfo = async () => {
    try {
      const response = await fetch('/api/ddownload/account-info');
      const data = await response.json();
      if (data.status === 200) {
        setAccountInfo(data.result);
      }
    } catch (error) {
      console.error('Error fetching account info:', error);
    }
  };

  const getAccountStats = async () => {
    try {
      const response = await fetch('/api/ddownload/account-stats?last=7');
      const data = await response.json();
      if (data.status === 200) {
        setAccountStats(data.result);
      }
    } catch (error) {
      console.error('Error fetching account stats:', error);
    }
  };

 // REPLACE the existing loadFiles function
const loadFiles = async () => {
  try {
    console.log(`🔍 Loading files for folder: ${currentFolder}`);
    
    const response = await fetch(`/api/ddownload/files/list?folder_id=${currentFolder}`);
    const data = await response.json();
    
    if (data.status === 200) {
      const filesList = data.result?.files || [];
      console.log(`✅ Loaded ${filesList.length} files:`, filesList);
      
      // Map files with REAL preview URLs
      const mappedFiles = filesList.map(file => {
        const fileType = getFileType(file.name);
        let preview_url = null;
        let thumbnail_url = null;
        
        if (fileType === 'image') {
          // Use actual download link for images
          preview_url = file.link || `https://ddownload.com/${file.file_code}`;
          thumbnail_url = `/api/ddownload/files/thumbnail?file_code=${file.file_code}`;
        }
        
        return {
          file_code: file.file_code,
          filename: file.name,
          size: file.size,
          uploaded: file.uploaded,
          downloads: file.downloads || 0,
          folder_id: file.fld_id,
          link: file.link,
          public: file.public,
          created_at: file.uploaded,
          modified_at: file.uploaded,
          file_type: fileType,
          preview_url,
          thumbnail_url
        };
      });
      
      setFiles([...mappedFiles]);
      
      if (mappedFiles.length > 0) {
        setRecentActivity(prev => [
          { type: 'folder_view', folder: folderPath[folderPath.length - 1].name, count: mappedFiles.length, timestamp: new Date() },
          ...prev.slice(0, 9)
        ]);
      }
    } else {
      console.error('Failed to load files:', data);
      setFiles([]);
    }
  } catch (error) {
    console.error('Error loading files:', error);
    setFiles([]);
  }
};


  const loadFolders = async () => {
    try {
      console.log(`🔍 Loading folders for parent: ${currentFolder}`);
      
      const response = await fetch(`/api/ddownload/folders/list?folder_id=${currentFolder}`);
      const data = await response.json();
      
      if (data.status === 200) {
        const foldersList = data.result?.folders || [];
        console.log(`✅ Loaded ${foldersList.length} folders:`, foldersList);
        setFolders(foldersList);
      } else {
        console.error('Failed to load folders:', data);
        setFolders([]);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      setFolders([]);
    }
  };

  const loadAnalytics = async () => {
    setAnalytics({
      totalUploads: files.length,
      totalDownloads: files.reduce((sum, file) => sum + (file.downloads || 0), 0),
      storageUsed: files.reduce((sum, file) => sum + (file.size || 0), 0),
      popularFiles: files.sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 5),
      recentUploads: files.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded)).slice(0, 5)
    });
  };

  const getFileType = (filename) => {
    if (!filename) return 'other';
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'].includes(ext)) return 'image';
    if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', '3gp'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'flac', 'm4a', 'ogg', 'aac', 'wma'].includes(ext)) return 'audio';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages'].includes(ext)) return 'document';
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return 'archive';
    return 'other';
  };

  // Enhanced preview URL generation with better image sources
  // REPLACE these existing functions around line 150-180
// REPLACE around line 150-180
// REPLACE around line 150-180
const getPreviewUrl = (fileCode, filename, downloadLink) => {
  if (!filename) return null;
  
  const fileType = getFileType(filename);
  
  if (fileType === 'image') {
    // Use the direct download link from DDownload
    return downloadLink || `https://ddownload.com/${fileCode}`;
  }
  
  return null;
};

const getThumbnailUrl = (fileCode, filename, downloadLink) => {
  if (!filename) return null;
  
  const fileType = getFileType(filename);
  
  if (fileType === 'image') {
    // Use your thumbnail proxy API
    return `/api/ddownload/files/thumbnail?file_code=${fileCode}`;
  }
  
  return null;
};


  const uploadFile = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadResponse = await fetch('/api/ddownload/upload/complete', { method: 'POST' });
      const uploadData = await uploadResponse.json();
      
      if (uploadData.status === 200) {
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + Math.random() * 20;
          });
        }, 500);

        // Demo mode simulation
        setTimeout(() => {
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          const newFile = {
            file_code: "demo_" + Date.now(),
            filename: file.name,
            size: file.size,
            uploaded: new Date().toISOString(),
            downloads: 0,
            folder_id: currentFolder,
            file_type: getFileType(file.name),
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString(),
            preview_url: getPreviewUrl("demo_" + Date.now(), file.name, null),
            thumbnail_url: getThumbnailUrl("demo_" + Date.now(), file.name, null)
          };
          
          setFiles(prev => [newFile, ...prev]);
          
          setRecentActivity(prev => [
            { type: 'upload', filename: file.name, timestamp: new Date() },
            ...prev.slice(0, 9)
          ]);
          
          setTimeout(() => {
            setUploading(false);
            setUploadProgress(0);
          }, 1000);
        }, 2000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setUploadProgress(0);
      alert('Upload failed. Please try again.');
    }
  };

  // Rest of your functions remain the same...
  const processedFiles = useMemo(() => {
    if (!Array.isArray(files)) return [];

    let filtered = [...files];

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'favorites') {
        filtered = filtered.filter(file => favoriteFiles.has(file.file_code));
      } else {
        filtered = filtered.filter(file => file.file_type === selectedCategory.slice(0, -1) || 
          (selectedCategory === 'images' && file.file_type === 'image') ||
          (selectedCategory === 'videos' && file.file_type === 'video') ||
          (selectedCategory === 'documents' && file.file_type === 'document'));
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(file => 
        file.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tags[file.file_code]?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (advancedFilters.dateRange !== 'all') {
      const now = new Date();
      const ranges = {
        'today': 1,
        'week': 7,
        'month': 30,
        'year': 365
      };
      const days = ranges[advancedFilters.dateRange];
      if (days) {
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(file => new Date(file.uploaded) >= cutoff);
      }
    }

    if (advancedFilters.sizeRange !== 'all') {
      const sizeRanges = {
        'small': [0, 1024 * 1024],
        'medium': [1024 * 1024, 100 * 1024 * 1024],
        'large': [100 * 1024 * 1024, Infinity]
      };
      const [min, max] = sizeRanges[advancedFilters.sizeRange] || [0, Infinity];
      filtered = filtered.filter(file => file.size >= min && file.size <= max);
    }

    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'name':
          compareValue = (a.filename || '').localeCompare(b.filename || '');
          break;
        case 'size':
          compareValue = (a.size || 0) - (b.size || 0);
          break;
        case 'downloads':
          compareValue = (a.downloads || 0) - (b.downloads || 0);
          break;
        case 'date':
        default:
          compareValue = new Date(a.uploaded) - new Date(b.uploaded);
          break;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [files, searchQuery, selectedCategory, favoriteFiles, tags, advancedFilters, sortBy, sortOrder]);

  const toggleFileSelection = (fileCode) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileCode)) {
      newSelected.delete(fileCode);
    } else {
      newSelected.add(fileCode);
    }
    setSelectedFiles(newSelected);
  };

  const selectAllFiles = () => {
    if (selectedFiles.size === processedFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(processedFiles.map(f => f.file_code)));
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedFiles.size} selected files?`)) return;
    
    try {
      for (const fileCode of selectedFiles) {
        await fetch('/api/ddownload/files/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_code: fileCode })
        });
      }
      
      setSelectedFiles(new Set());
      await loadFiles();
      setRecentActivity(prev => [
        { type: 'bulk_delete', count: selectedFiles.size, timestamp: new Date() },
        ...prev.slice(0, 9)
      ]);
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Some files could not be deleted');
    }
  };

  const toggleFavorite = (fileCode) => {
    const newFavorites = new Set(favoriteFiles);
    if (newFavorites.has(fileCode)) {
      newFavorites.delete(fileCode);
    } else {
      newFavorites.add(fileCode);
    }
    setFavoriteFiles(newFavorites);
  };

  const getFileIcon = (filename) => {
    if (!filename) return FileText;
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return Image;
    if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) return Video;
    if (['mp3', 'wav', 'flac', 'm4a', 'ogg'].includes(ext)) return Music;
    if (['zip', 'rar', '7z', 'tar'].includes(ext)) return Archive;
    return FileText;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyShareLink = async (fileCode) => {
    const shareLink = `https://ddownload.com/${fileCode}`;
    try {
      await navigator.clipboard.writeText(shareLink);
      setRecentActivity(prev => [
        { type: 'share', fileCode, timestamp: new Date() },
        ...prev.slice(0, 9)
      ]);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Enhanced Image Preview Component with better UI
  const ImagePreview = ({ file, onClose }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="relative max-w-6xl max-h-full bg-gray-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between p-4 bg-gray-800/80 backdrop-blur-sm border-b border-white/10">
            <div>
              <h3 className="text-lg font-semibold text-white">{file.filename}</h3>
              <p className="text-sm text-gray-400">{formatFileSize(file.size)} • {file.file_type.toUpperCase()}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyShareLink(file.file_code)}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Share2 size={16} />
              </button>
              <button
                onClick={() => toggleFavorite(file.file_code)}
                className={`p-2 rounded-lg transition-colors ${
                  favoriteFiles.has(file.file_code) 
                    ? 'bg-yellow-500/20 text-yellow-400' 
                    : 'bg-white/10 hover:bg-white/20 text-gray-400'
                }`}
              >
                {favoriteFiles.has(file.file_code) ? 
                  <Star size={16} fill="currentColor" /> : 
                  <Star size={16} />
                }
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-gray-300 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center min-h-[60vh] max-h-[80vh] bg-black">
            {!loaded && !error && (
              <div className="flex flex-col items-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                <p>Loading preview...</p>
              </div>
            )}
            {error ? (
              <div className="text-center text-gray-400">
                <Image size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Preview not available</p>
                <p className="text-sm">Unable to load image preview for {file.filename}</p>
              </div>
            ) : (
              <img
                src={file.preview_url}
                alt={file.filename}
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                  loaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setLoaded(true)}
                onError={() => {
                  console.log('Image load error for:', file.preview_url);
                  setError(true);
                }}
                style={{ maxHeight: '70vh' }}
              />
            )}
          </div>

          <div className="p-4 bg-gray-800/80 backdrop-blur-sm border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Uploaded: {new Date(file.uploaded).toLocaleDateString()}</span>
              <span>•</span>
              <span>{file.downloads} downloads</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.open(`https://ddownload.com/${file.file_code}`, '_blank')}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-xl">Loading your files...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white
                 pt-[calc(env(safe-area-inset-top)+1rem)]
                 pb-[calc(env(safe-area-inset-bottom)+5rem)]"
    >
      {/* Enhanced Header */}
      <div className="px-6 pt-8 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Cloud className="mr-3 text-blue-500" size={32} />
              File Manager Pro
            </h1>
            <p className="text-gray-400 text-lg">Advanced file management with previews</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedFiles.size > 0 && (
              <div className="flex items-center space-x-2 bg-blue-600/20 px-4 py-2 rounded-full">
                <span className="text-sm">{selectedFiles.size} selected</span>
                <button 
                  onClick={bulkDelete}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={`p-3 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all border border-white/20 ${
                showAdvancedSearch ? 'bg-blue-500/30' : 'bg-white/10'
              }`}
            >
              <Filter size={20} />
            </button>
            
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-3 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all border border-white/20"
            >
              {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
            </button>
            
            <button 
              onClick={() => loadData()}
              className="p-3 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all border border-white/20"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Enhanced Account Stats */}
        {accountInfo && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <HardDrive className="text-blue-400 mb-2" size={24} />
              <div className="text-2xl font-bold">{accountInfo.storage_left}</div>
              <div className="text-sm text-gray-400">Storage Left</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <Download className="text-green-400 mb-2" size={24} />
              <div className="text-2xl font-bold">{analytics?.totalDownloads || 0}</div>
              <div className="text-sm text-gray-400">Total Downloads</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <BarChart3 className="text-purple-400 mb-2" size={24} />
              <div className="text-2xl font-bold">{files.length}</div>
              <div className="text-sm text-gray-400">Files</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <Star className="text-yellow-400 mb-2" size={24} />
              <div className="text-2xl font-bold">{favoriteFiles.size}</div>
              <div className="text-sm text-gray-400">Favorites</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <TrendingUp className="text-orange-400 mb-2" size={24} />
              <div className="text-2xl font-bold">{recentActivity.length}</div>
              <div className="text-sm text-gray-400">Activities</div>
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? `bg-${category.color}-500 text-white`
                    : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
              >
                <IconComponent size={16} />
                <span>{category.name}</span>
                {category.id === 'favorites' && favoriteFiles.size > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {favoriteFiles.size}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search files, folders, and tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          {processedFiles.length > 0 && (
            <button
              onClick={selectAllFiles}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-2xl font-medium transition-colors"
            >
              {selectedFiles.size === processedFiles.length ? <CheckSquare size={20} /> : <Square size={20} />}
              <span>Select All</span>
            </button>
          )}
          
          <button
            onClick={() => setShowCreateFolder(true)}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-2xl font-medium transition-colors"
          >
            <FolderPlus size={20} />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div className="px-6 mb-8">
        <div 
          className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
            uploading 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-white/30 hover:border-blue-500'
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!uploading) {
              const droppedFiles = Array.from(e.dataTransfer.files);
              droppedFiles.forEach(uploadFile);
            }
          }}
        >
          {uploading ? (
            <div className="space-y-4">
              <RefreshCw className="animate-spin mx-auto text-blue-400" size={48} />
              <h3 className="text-xl font-semibold">Uploading...</h3>
              <div className="w-full bg-white/20 rounded-full h-2 max-w-md mx-auto">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-gray-400">{Math.round(uploadProgress)}% complete</p>
            </div>
          ) : (
            <div>
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold mb-2">Drop files here to upload</h3>
              <p className="text-gray-400 mb-4">Files will be uploaded to: {folderPath[folderPath.length - 1].name}</p>
              <input
                type="file"
                multiple
                className="hidden"
                id="fileInput"
                onChange={(e) => Array.from(e.target.files).forEach(uploadFile)}
              />
              <label
                htmlFor="fileInput"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl font-semibold cursor-pointer transition-colors inline-block"
              >
                Choose Files
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Files Display with Enhanced Thumbnails */}
      <div className="px-6 pb-32">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 text-sm">
            {folderPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const newPath = folderPath.slice(0, index + 1);
                    setFolderPath(newPath);
                    setCurrentFolder(newPath[newPath.length - 1].id);
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    index === folderPath.length - 1
                      ? 'bg-blue-500 text-white'
                      : 'text-blue-400 hover:bg-blue-500/20'
                  }`}
                >
                  {folder.name}
                </button>
                {index < folderPath.length - 1 && (
                  <ChevronRight size={16} className="text-gray-500" />
                )}
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-400">
            {processedFiles.length} files • {folders.length} folders
          </div>
        </div>

        {/* Folders */}
        {folders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Folder className="mr-2 text-yellow-400" size={20} />
              Folders ({folders.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {folders.map((folder) => (
                <div key={folder.id} className="group cursor-pointer">
                  <div 
                    onClick={() => {
                      setCurrentFolder(folder.id);
                      setFolderPath(prev => [...prev, folder]);
                    }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10 hover:bg-white/10 transition-all group"
                  >
                    <Folder size={48} className="mx-auto mb-3 text-yellow-400 group-hover:text-yellow-300" />
                    <h4 className="font-medium text-white text-sm line-clamp-2">{folder.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files with Enhanced Preview System */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="mr-2 text-blue-400" size={20} />
            Files ({processedFiles.length})
          </h3>
          
          {processedFiles.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="mx-auto text-gray-500 mb-4" size={64} />
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">No files found</h3>
              <p className="text-gray-500">Upload some files or try adjusting your filters</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {processedFiles.map((file) => {
                const FileIcon = getFileIcon(file.filename);
                const isFavorite = favoriteFiles.has(file.file_code);
                const isSelected = selectedFiles.has(file.file_code);
                const hasPreview = file.file_type === 'image' && file.preview_url;
                
                if (viewMode === 'grid') {
                  return (
                    <div key={file.file_code} className={`bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border transition-all group ${
                      isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:bg-white/10'
                    }`}>
                      <div 
                        className="aspect-square bg-gray-800/50 flex items-center justify-center relative cursor-pointer"
                        onClick={() => {
                          if (hasPreview) {
                            setShowImagePreview(file);
                          }
                        }}
                      >
{hasPreview ? (
  <div className="w-full h-full relative">
    <img 
      src={file.thumbnail_url}
      alt={file.filename}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      loading="lazy"
      onError={(e) => {
        console.log('Thumbnail failed, trying direct link for:', file.filename);
        // Try direct download link as fallback
        if (file.link && e.target.src !== file.link) {
          e.target.src = file.link;
        } else if (file.preview_url && e.target.src !== file.preview_url) {
          e.target.src = file.preview_url;
        } else {
          // Finally show file icon
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }
      }}
    />
    <div className="hidden w-full h-full items-center justify-center bg-gray-800">
      <FileIcon size={48} className="text-gray-400" />
    </div>
    {/* Preview indicator */}
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
      <Eye size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  </div>
) : (
  <FileIcon size={48} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
)}            
                        {/* File badges */}
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                            <span className="text-xs text-white">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        
                        <div className="absolute top-2 left-2 flex space-x-1">
                          {file.downloads > 0 && (
                            <div className="bg-green-500/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                              <span className="text-xs text-white">{file.downloads} ⬇️</span>
                            </div>
                          )}
                        </div>

                        {/* Selection checkbox */}
                        <div className="absolute bottom-2 left-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFileSelection(file.file_code);
                            }}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                              isSelected 
                                ? 'bg-blue-500 border-blue-500 text-white' 
                                : 'border-white/30 bg-black/50'
                            }`}
                          >
                            {isSelected && <CheckCircle size={14} />}
                          </button>
                        </div>

                        {/* Favorite button */}
                        <div className="absolute bottom-2 right-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(file.file_code);
                            }}
                            className={`p-1 rounded-full transition-colors ${
                              isFavorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                            }`}
                          >
                            {isFavorite ? <Star size={16} fill="currentColor" /> : <Star size={16} />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-2 line-clamp-1">{file.filename}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                          <span>{new Date(file.uploaded).toLocaleDateString()}</span>
                          <span>{file.downloads} downloads</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => copyShareLink(file.file_code)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                          >
                            <Link size={12} />
                            <span>Share</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowFileInfo({...file, link: `https://ddownload.com/${file.file_code}`});
                            }}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          >
                            <Info size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this file?')) {
                                setFiles(prev => prev.filter(f => f.file_code !== file.file_code));
                                setRecentActivity(prev => [
                                  { type: 'delete', filename: file.filename, timestamp: new Date() },
                                  ...prev.slice(0, 9)
                                ]);
                              }
                            }}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={file.file_code} className={`bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between border transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:bg-white/10'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => toggleFileSelection(file.file_code)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500 text-white' 
                              : 'border-white/30'
                          }`}
                        >
                          {isSelected && <CheckCircle size={12} />}
                        </button>
                        
                        <div 
                          className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer"
                          onClick={() => {
                            if (hasPreview) {
                              setShowImagePreview(file);
                            }
                          }}
                        >
                          {hasPreview ? (
                            <img 
                              src={file.thumbnail_url || file.preview_url} 
                              alt={file.filename}
                              className="w-full h-full object-cover hover:scale-110 transition-transform"
                              loading="lazy"
                              // REPLACE the image onError handler
onError={(e) => {
  console.log('Image load error for:', file.filename);
  
  // Don't try ddl.to links directly - they cause SSL errors
  // Instead, show the file icon
  e.target.style.display = 'none';
  const iconDiv = e.target.nextSibling;
  if (iconDiv) {
    iconDiv.style.display = 'flex';
  }
}}

                            />
                          ) : null}
                          <FileIcon size={20} className="text-blue-400" style={{display: hasPreview ? 'none' : 'block'}} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-white">{file.filename}</h3>
                            {isFavorite && <Star size={16} className="text-yellow-400" fill="currentColor" />}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>{new Date(file.uploaded).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{file.downloads} downloads</span>
                            {hasPreview && <span className="text-blue-400">• Preview available</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleFavorite(file.file_code)}
                          className={`p-2 rounded-xl transition-colors ${
                            isFavorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                          }`}
                        >
                          {isFavorite ? <Star size={16} fill="currentColor" /> : <Star size={16} />}
                        </button>
                        
                        <button 
                          onClick={() => copyShareLink(file.file_code)}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2"
                        >
                          <Link size={14} />
                          <span>Share</span>
                        </button>
                        
                        <button
                          onClick={() => setShowFileInfo({...file, link: `https://ddownload.com/${file.file_code}`})}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                        >
                          <Info size={14} />
                        </button>
                        
                        <button
                          onClick={() => {
                            if (confirm('Delete this file?')) {
                              setFiles(prev => prev.filter(f => f.file_code !== file.file_code));
                              setRecentActivity(prev => [
                                { type: 'delete', filename: file.filename, timestamp: new Date() },
                                ...prev.slice(0, 9)
                              ]);
                            }
                          }}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && (
        <ImagePreview 
          file={showImagePreview} 
          onClose={() => setShowImagePreview(null)} 
        />
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-md border border-white/10">
            <h3 className="text-xl font-bold mb-4">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-6"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-2xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newFolderName.trim()) {
                    const newFolder = {
                      id: Date.now(),
                      name: newFolderName,
                      parent_id: currentFolder
                    };
                    setFolders(prev => [newFolder, ...prev]);
                    setNewFolderName('');
                    setShowCreateFolder(false);
                    setRecentActivity(prev => [
                      { type: 'folder_create', folder: newFolderName, timestamp: new Date() },
                      ...prev.slice(0, 9)
                    ]);
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-2xl font-medium transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Info Modal */}
      {showFileInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-lg border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">File Information</h3>
              <button
                onClick={() => setShowFileInfo(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl">
                {React.createElement(getFileIcon(showFileInfo.filename), { size: 48, className: "text-blue-400" })}
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{showFileInfo.filename}</h4>
                  <p className="text-gray-400">{getFileType(showFileInfo.filename).charAt(0).toUpperCase() + getFileType(showFileInfo.filename).slice(1)} File</p>
                </div>
                <button
                  onClick={() => toggleFavorite(showFileInfo.file_code)}
                  className={`p-2 rounded-full transition-colors ${
                    favoriteFiles.has(showFileInfo.file_code) ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                  }`}
                >
                  {favoriteFiles.has(showFileInfo.file_code) ? 
                    <Star size={24} fill="currentColor" /> : 
                    <Star size={24} />
                  }
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl">
                  <label className="text-sm text-gray-400">File Size</label>
                  <div className="text-white font-medium">{formatFileSize(showFileInfo.size)}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <label className="text-sm text-gray-400">Downloads</label>
                  <div className="text-white font-medium">{showFileInfo.downloads}</div>
                </div>
              </div>
              
              <div className="p-3 bg-white/5 rounded-xl">
                <label className="text-sm text-gray-400">Upload Date</label>
                <div className="text-white font-medium">{new Date(showFileInfo.uploaded).toLocaleString()}</div>
              </div>
              
              <div className="p-3 bg-white/5 rounded-xl">
                <label className="text-sm text-gray-400">Share Link</label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="text"
                    value={showFileInfo.link}
                    readOnly
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <button
                    onClick={() => copyShareLink(showFileInfo.file_code)}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => copyShareLink(showFileInfo.file_code)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 size={16} />
                  <span>Share File</span>
                </button>
                <button
                  onClick={() => window.open(showFileInfo.link, '_blank')}
                  className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
