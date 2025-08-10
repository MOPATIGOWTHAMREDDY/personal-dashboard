import React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Upload, Folder, Download, BarChart3, FileText, Image, Video, Music,
  Share2, Trash2, Plus, Search, Filter, Grid, List, Cloud, HardDrive,
  RefreshCw, Link, Copy, CheckCircle, Edit3, FolderPlus, ArrowLeft,
  MoreVertical, Move, Info, Calendar, Eye, X, ChevronRight, Star, StarOff,
  SortAsc, SortDesc, Zap, Shield, Clock, Users, Tag, Archive, Activity,
  TrendingUp, FileCheck, AlertCircle, CheckSquare, Square, Play, Pause,
  Volume2, ZoomIn, Settings, Key, LogIn, LogOut, Wifi, WifiOff, Database,
  Server, Globe, Smartphone, Mail
} from 'lucide-react';

const MultiDriveFileManager = () => {
  // Existing state
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(0);
  const [folderPath, setFolderPath] = useState([{ id: 0, name: 'Home' }]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showFileInfo, setShowFileInfo] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [showImagePreview, setShowImagePreview] = useState(null);
  const [favoriteFiles, setFavoriteFiles] = useState(new Set());

  // Multi-drive state
  const [currentDrive, setCurrentDrive] = useState('ddownload');
  const [connectedDrives, setConnectedDrives] = useState({
    ddownload: { connected: true },
    googledrive: { connected: false },
    mega: { connected: false },
    terabox: { connected: false },
    degoo: { connected: false }
  });
  const [driveStats, setDriveStats] = useState({});
  const [showDriveSetup, setShowDriveSetup] = useState(false);
  const [setupDrive, setSetupDrive] = useState(null);
  const [authInProgress, setAuthInProgress] = useState(null);
  const [loginMessage, setLoginMessage] = useState('');

  // Sample files for demonstration
  const sampleFiles = [
    {
      id: 'sample1',
      name: 'vacation-photos.zip',
      size: 25600000,
      created_at: '2024-01-15T10:30:00Z',
      type: 'archive',
      downloads: 12,
      link: '#',
      drive: 'ddownload'
    },
    {
      id: 'sample2',
      name: 'presentation.pdf',
      size: 5120000,
      created_at: '2024-01-20T14:45:00Z',
      type: 'document',
      downloads: 8,
      link: '#',
      drive: 'ddownload'
    },
    {
      id: 'sample3',
      name: 'music-collection.mp3',
      size: 8960000,
      created_at: '2024-01-18T09:15:00Z',
      type: 'audio',
      downloads: 25,
      link: '#',
      drive: 'ddownload'
    }
  ];

  // Sample folders
  const sampleFolders = [
    { id: 'folder1', name: 'Documents', drive: 'ddownload' },
    { id: 'folder2', name: 'Media Files', drive: 'ddownload' },
    { id: 'folder3', name: 'Projects', drive: 'ddownload' }
  ];

  // Available cloud drives
  const cloudDrives = [
    {
      id: 'ddownload',
      name: 'DDownload',
      icon: Database,
      color: 'blue',
      maxStorage: '2TB',
      description: 'File hosting service',
      connected: true,
      builtin: true,
      loginType: 'builtin'
    },
    {
      id: 'googledrive',
      name: 'Google Drive',
      icon: Globe,
      color: 'blue',
      maxStorage: '15GB Free / 100GB+',
      description: 'Google cloud storage',
      connected: connectedDrives.googledrive?.connected || false,
      loginType: 'oauth',
      loginUrl: 'https://accounts.google.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT&scope=https://www.googleapis.com/auth/drive&response_type=code'
    },
    {
      id: 'mega',
      name: 'MEGA',
      icon: Shield,
      color: 'red',
      maxStorage: '20GB Free / 400GB+',
      description: 'Encrypted cloud storage',
      connected: connectedDrives.mega?.connected || false,
      loginType: 'credentials',
      fields: [
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'password', label: 'Password', type: 'password', required: true }
      ]
    },
    {
      id: 'terabox',
      name: 'TeraBox',
      icon: Archive,
      color: 'purple',
      maxStorage: '1TB Free',
      description: 'High capacity storage',
      connected: connectedDrives.terabox?.connected || false,
      loginType: 'oauth',
      loginUrl: 'https://www.terabox.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT&response_type=code'
    },
    {
      id: 'pcloud',
      name: 'pCloud',
      icon: Cloud,
      color: 'indigo',
      maxStorage: '10GB Free / 2TB+',
      description: 'Lifetime cloud storage',
      connected: connectedDrives.pcloud?.connected || false,
      loginType: 'oauth',
      loginUrl: 'https://my.pcloud.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT&response_type=code'
    },
    {
      id: 'icedrive',
      name: 'Icedrive',
      icon: Zap,
      color: 'cyan',
      maxStorage: '10GB Free / 5TB+',
      description: 'Fast cloud storage',
      connected: connectedDrives.icedrive?.connected || false,
      loginType: 'oauth',
      loginUrl: 'https://icedrive.net/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT&response_type=code'
    },
    {
      id: 'degoo',
      name: 'Degoo',
      icon: Smartphone,
      color: 'green',
      maxStorage: '100GB Free',
      description: 'Mobile-first storage',
      connected: connectedDrives.degoo?.connected || false,
      loginType: 'credentials',
      fields: [
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'password', label: 'Password', type: 'password', required: true }
      ]
    }
  ];

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
  }, [currentDrive, currentFolder]);

  const loadData = () => {
    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      if (currentDrive === 'ddownload' || connectedDrives[currentDrive]?.connected) {
        setFiles(sampleFiles);
        setFolders(sampleFolders);
      } else {
        setFiles([]);
        setFolders([]);
      }
      setLoading(false);
    }, 500);
  };

  const connectDrive = async (driveId) => {
    const drive = cloudDrives.find(d => d.id === driveId);
    if (!drive) return;

    setAuthInProgress(driveId);
    setLoginMessage(`Connecting to ${drive.name}...`);
    
    try {
      if (drive.loginType === 'oauth') {
        // OAuth flow - open popup window
        const authWindow = window.open(
          drive.loginUrl,
          `${driveId}_auth`,
          'width=600,height=700,scrollbars=yes,resizable=yes,left=' + 
          (window.screen.width/2 - 300) + ',top=' + (window.screen.height/2 - 350)
        );

        if (!authWindow) {
          alert('Popup blocked! Please allow popups for this site to login.');
          setAuthInProgress(null);
          setLoginMessage('');
          return;
        }

        // Simulate OAuth flow
        setTimeout(() => {
          if (!authWindow.closed) {
            authWindow.close();
          }
          
          // Simulate successful OAuth
          setConnectedDrives(prev => ({
            ...prev,
            [driveId]: { 
              connected: true, 
              accessToken: 'mock_token_' + driveId,
              email: `user@${driveId}.com`,
              connectedAt: new Date().toISOString()
            }
          }));
          
          setDriveStats(prev => ({
            ...prev,
            [driveId]: {
              fileCount: Math.floor(Math.random() * 100) + 10,
              usedStorage: Math.floor(Math.random() * 1000000000) + 100000000
            }
          }));
          
          setAuthInProgress(null);
          setLoginMessage('');
          alert(`Successfully connected to ${drive.name}!`);
        }, 2000);

        // Listen for auth completion (in real app, this would be handled differently)
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            if (authInProgress === driveId) {
              setAuthInProgress(null);
              setLoginMessage('');
            }
          }
        }, 1000);

      } else if (drive.loginType === 'credentials') {
        // Show credentials form
        setSetupDrive(driveId);
        setShowDriveSetup(true);
        setAuthInProgress(null);
        setLoginMessage('');
      }
    } catch (error) {
      console.error(`Error connecting to ${driveId}:`, error);
      setAuthInProgress(null);
      setLoginMessage('');
      alert(`Failed to connect to ${drive.name}`);
    }
  };

  const disconnectDrive = async (driveId) => {
    if (confirm(`Are you sure you want to disconnect from ${cloudDrives.find(d => d.id === driveId)?.name}?`)) {
      setConnectedDrives(prev => ({
        ...prev,
        [driveId]: { connected: false }
      }));
      
      if (currentDrive === driveId) {
        setCurrentDrive('ddownload');
        setCurrentFolder(0);
        setFolderPath([{ id: 0, name: 'Home' }]);
      }
    }
  };

  const submitDriveCredentials = async (credentials) => {
    const drive = cloudDrives.find(d => d.id === setupDrive);
    
    if (!credentials.email || !credentials.password) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoginMessage(`Authenticating with ${drive.name}...`);
      
      // Simulate credential validation
      setTimeout(() => {
        // Simulate successful login
        setConnectedDrives(prev => ({
          ...prev,
          [setupDrive]: { 
            connected: true, 
            email: credentials.email,
            connectedAt: new Date().toISOString()
          }
        }));
        
        setDriveStats(prev => ({
          ...prev,
          [setupDrive]: {
            fileCount: Math.floor(Math.random() * 100) + 10,
            usedStorage: Math.floor(Math.random() * 1000000000) + 100000000
          }
        }));
        
        setShowDriveSetup(false);
        setSetupDrive(null);
        setLoginMessage('');
        alert(`Successfully connected to ${drive.name}!`);
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting credentials:', error);
      alert('Authentication failed. Please check your credentials.');
      setLoginMessage('');
    }
  };

  const getFileType = (filename) => {
    if (!filename) return 'other';
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'flac', 'm4a', 'ogg'].includes(ext)) return 'audio';
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return 'document';
    return 'other';
  };

  const getFileIcon = (filename) => {
    if (!filename) return FileText;
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return Image;
    if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) return Video;
    if (['mp3', 'wav', 'flac', 'm4a', 'ogg'].includes(ext)) return Music;
    return FileText;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFile = async (file) => {
    if (!connectedDrives[currentDrive]?.connected) {
      alert(`Please connect to ${cloudDrives.find(d => d.id === currentDrive)?.name} first`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          
          // Add uploaded file to the list
          const newFile = {
            id: 'uploaded_' + Date.now(),
            name: file.name,
            size: file.size,
            created_at: new Date().toISOString(),
            type: getFileType(file.name),
            downloads: 0,
            link: '#',
            drive: currentDrive
          };
          
          setFiles(prev => [newFile, ...prev]);
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Drive Setup Modal Component
  const DriveSetupModal = () => {
    const [credentials, setCredentials] = useState({});
    const drive = cloudDrives.find(d => d.id === setupDrive);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-md border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {React.createElement(drive?.icon || Cloud, { size: 24, className: `text-${drive?.color}-400` })}
              <h3 className="text-xl font-bold">Connect {drive?.name}</h3>
            </div>
            <button
              onClick={() => {
                setShowDriveSetup(false);
                setSetupDrive(null);
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-400">Enter your {drive?.name} credentials to connect your account</p>
          </div>

          <div className="space-y-4 mb-6">
            {drive?.fields?.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type={field.type}
                    value={credentials[field.key] || ''}
                    onChange={(e) => setCredentials(prev => ({
                      ...prev,
                      [field.key]: e.target.value
                    }))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    required={field.required}
                  />
                  {field.type === 'email' && (
                    <Mail className="absolute right-3 top-3 text-gray-400" size={20} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {loginMessage && (
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl">
              <div className="flex items-center space-x-2 text-blue-400">
                <RefreshCw className="animate-spin" size={16} />
                <span className="text-sm">{loginMessage}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowDriveSetup(false);
                setSetupDrive(null);
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => submitDriveCredentials(credentials)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <LogIn size={16} />
              <span>Connect</span>
            </button>
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
          <p className="text-xl">Loading your drives...</p>
        </div>
      </div>
    );
  }

  const currentDriveInfo = cloudDrives.find(d => d.id === currentDrive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Cloud className="mr-3 text-blue-500" size={32} />
              Multi-Drive Manager
            </h1>
            <p className="text-gray-400 text-lg">Manage files across multiple cloud services</p>
          </div>
          
          <div className="flex items-center space-x-3">
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

        {/* Login Status Message */}
        {loginMessage && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-2xl">
            <div className="flex items-center space-x-3 text-blue-400">
              <RefreshCw className="animate-spin" size={20} />
              <span>{loginMessage}</span>
            </div>
          </div>
        )}

        {/* Drive Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <HardDrive className="mr-2 text-blue-400" size={20} />
            Available Drives
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cloudDrives.map((drive) => {
              const DriveIcon = drive.icon;
              const isActive = currentDrive === drive.id;
              const isConnected = drive.connected || connectedDrives[drive.id]?.connected;
              const isAuthenticating = authInProgress === drive.id;
              
              return (
                <div 
                  key={drive.id}
                  className={`bg-white/5 backdrop-blur-xl rounded-2xl p-4 border transition-all cursor-pointer ${
                    isActive 
                      ? `border-${drive.color}-500 bg-${drive.color}-500/10` 
                      : 'border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => {
                    if (isConnected && !isAuthenticating) {
                      setCurrentDrive(drive.id);
                      setCurrentFolder(0);
                      setFolderPath([{ id: 0, name: 'Home' }]);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <DriveIcon 
                      size={32} 
                      className={`text-${drive.color}-400`} 
                    />
                    <div className="flex items-center space-x-2">
                      {isConnected ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          {!drive.builtin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                disconnectDrive(drive.id);
                              }}
                              className="p-1 hover:bg-white/10 rounded-full transition-colors"
                              title="Disconnect"
                            >
                              <LogOut size={14} className="text-red-400" />
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            connectDrive(drive.id);
                          }}
                          disabled={isAuthenticating}
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:opacity-50"
                          title="Connect"
                        >
                          {isAuthenticating ? (
                            <RefreshCw size={14} className="animate-spin text-white" />
                          ) : (
                            <LogIn size={14} className="text-white" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-white mb-1">{drive.name}</h4>
                  <p className="text-xs text-gray-400 mb-2">{drive.description}</p>
                  
                  {isConnected ? (
                    <div className="text-xs space-y-1">
                      <div className="text-green-400 font-medium">✓ Connected</div>
                      {connectedDrives[drive.id]?.email && (
                        <div className="text-gray-500">{connectedDrives[drive.id].email}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs space-y-1">
                      <div className="text-gray-500">{drive.maxStorage}</div>
                      <div className="text-yellow-400">Click to connect</div>
                    </div>
                  )}
                  
                  {isConnected && driveStats[drive.id] && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>Files: {driveStats[drive.id].fileCount || 0}</div>
                        <div>Used: {formatFileSize(driveStats[drive.id].usedStorage || 0)}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Drive Info */}
        {currentDriveInfo && (connectedDrives[currentDrive]?.connected || currentDriveInfo.builtin) && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {React.createElement(currentDriveInfo.icon, { 
                  size: 24, 
                  className: `text-${currentDriveInfo.color}-400` 
                })}
                <div>
                  <h4 className="font-semibold text-white">Active: {currentDriveInfo.name}</h4>
                  <p className="text-sm text-gray-400">{files.length} files • {folders.length} folders</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-white">{formatFileSize(
                  files.reduce((sum, file) => sum + (file.size || 0), 0)
                )}</div>
                <div className="text-sm text-gray-400">Current folder</div>
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm mb-6">
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
      </div>

      {/* Search and Upload */}
      <div className="px-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Upload Area */}
        {currentDriveInfo && (connectedDrives[currentDrive]?.connected || currentDriveInfo.builtin) && (
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
                <h3 className="text-xl font-semibold">Uploading to {currentDriveInfo.name}...</h3>
                <div className="w-full bg-white/20 rounded-full h-2 max-w-md mx-auto">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-xl font-semibold mb-2">Drop files to upload to {currentDriveInfo.name}</h3>
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
        )}

        {/* Not Connected Message */}
        {currentDriveInfo && !connectedDrives[currentDrive]?.connected && !currentDriveInfo.builtin && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-yellow-400" size={48} />
            <h3 className="text-xl font-semibold mb-2 text-yellow-400">Drive Not Connected</h3>
            <p className="text-gray-400 mb-4">Please connect to {currentDriveInfo.name} to upload and manage files</p>
            <button
              onClick={() => connectDrive(currentDrive)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl font-semibold transition-colors inline-flex items-center space-x-2"
            >
              <LogIn size={20} />
              <span>Connect Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Files and Folders Display */}
      <div className="px-6 pb-32">
        {/* Folders */}
        {folders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Folder className="mr-2 text-yellow-400" size={20} />
              Folders ({folders.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {folders.map((folder) => (
                <div 
                  key={folder.id} 
                  className="group cursor-pointer"
                  onClick={() => {
                    setCurrentFolder(folder.id);
                    setFolderPath(prev => [...prev, folder]);
                  }}
                >
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10 hover:bg-white/10 transition-all">
                    <Folder size={48} className="mx-auto mb-3 text-yellow-400 group-hover:text-yellow-300" />
                    <h4 className="font-medium text-white text-sm line-clamp-2">{folder.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="mr-2 text-blue-400" size={20} />
            Files ({files.length})
          </h3>
          
          {files.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="mx-auto text-gray-500 mb-4" size={64} />
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">No files found</h3>
              <p className="text-gray-500">
                {currentDriveInfo && (connectedDrives[currentDrive]?.connected || currentDriveInfo.builtin)
                  ? "Upload some files or create folders" 
                  : "Connect a drive to start managing files"
                }
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {files.map((file) => {
                const FileIcon = getFileIcon(file.name);
                const isFavorite = favoriteFiles.has(file.id);
                
                if (viewMode === 'grid') {
                  return (
                    <div key={file.id} className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all group">
                      <div className="aspect-square bg-gray-800/50 flex items-center justify-center relative">
                        <FileIcon size={48} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                        
                        {/* File size badge */}
                        <div className="absolute top-2 right-2">
                          <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                            <span className="text-xs text-white">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        
                        {/* Drive badge */}
                        <div className="absolute top-2 left-2">
                          <div className={`bg-${currentDriveInfo?.color}-500/80 backdrop-blur-sm px-2 py-1 rounded-lg`}>
                            <span className="text-xs text-white">{currentDriveInfo?.name}</span>
                          </div>
                        </div>

                        {/* Favorite button */}
                        <div className="absolute bottom-2 right-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newFavorites = new Set(favoriteFiles);
                              if (newFavorites.has(file.id)) {
                                newFavorites.delete(file.id);
                              } else {
                                newFavorites.add(file.id);
                              }
                              setFavoriteFiles(newFavorites);
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
                        <h3 className="font-semibold text-white mb-2 line-clamp-1">{file.name}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                          <span>{new Date(file.created_at).toLocaleDateString()}</span>
                          {file.downloads && <span>{file.downloads} downloads</span>}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(file.link || `#shared-${file.id}`);
                              alert('Link copied to clipboard!');
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                          >
                            <Link size={12} />
                            <span>Share</span>
                          </button>
                          <button
                            onClick={() => setShowFileInfo(file)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          >
                            <Info size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this file?')) {
                                setFiles(prev => prev.filter(f => f.id !== file.id));
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
                  // List view
                  return (
                    <div key={file.id} className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                          <FileIcon size={20} className="text-blue-400" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-white">{file.name}</h3>
                            {isFavorite && <Star size={16} className="text-yellow-400" fill="currentColor" />}
                            <span className={`text-xs px-2 py-1 rounded-full bg-${currentDriveInfo?.color}-500/20 text-${currentDriveInfo?.color}-400`}>
                              {currentDriveInfo?.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>{new Date(file.created_at).toLocaleDateString()}</span>
                            {file.downloads && (
                              <>
                                <span>•</span>
                                <span>{file.downloads} downloads</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const newFavorites = new Set(favoriteFiles);
                            if (newFavorites.has(file.id)) {
                              newFavorites.delete(file.id);
                            } else {
                              newFavorites.add(file.id);
                            }
                            setFavoriteFiles(newFavorites);
                          }}
                          className={`p-2 rounded-xl transition-colors ${
                            isFavorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                          }`}
                        >
                          {isFavorite ? <Star size={16} fill="currentColor" /> : <Star size={16} />}
                        </button>
                        
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(file.link || `#shared-${file.id}`);
                            alert('Link copied to clipboard!');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2"
                        >
                          <Link size={14} />
                          <span>Share</span>
                        </button>
                        
                        <button
                          onClick={() => setShowFileInfo(file)}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                        >
                          <Info size={14} />
                        </button>
                        
                        <button
                          onClick={() => {
                            if (confirm('Delete this file?')) {
                              setFiles(prev => prev.filter(f => f.id !== file.id));
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
                {React.createElement(getFileIcon(showFileInfo.name), { 
                  size: 48, 
                  className: "text-blue-400" 
                })}
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{showFileInfo.name}</h4>
                  <p className="text-gray-400">{getFileType(showFileInfo.name).charAt(0).toUpperCase() + getFileType(showFileInfo.name).slice(1)} File</p>
                  <p className="text-sm text-gray-500">{currentDriveInfo?.name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl">
                  <label className="text-sm text-gray-400">File Size</label>
                  <div className="text-white font-medium">{formatFileSize(showFileInfo.size)}</div>
                </div>
                {showFileInfo.downloads && (
                  <div className="p-3 bg-white/5 rounded-xl">
                    <label className="text-sm text-gray-400">Downloads</label>
                    <div className="text-white font-medium">{showFileInfo.downloads}</div>
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-white/5 rounded-xl">
                <label className="text-sm text-gray-400">Created</label>
                <div className="text-white font-medium">{new Date(showFileInfo.created_at).toLocaleString()}</div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(showFileInfo.link || `#shared-${showFileInfo.id}`);
                    alert('Link copied to clipboard!');
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => {
                    window.open(showFileInfo.link || `#download-${showFileInfo.id}`, '_blank');
                  }}
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

      {/* Drive Setup Modal */}
      {showDriveSetup && <DriveSetupModal />}
    </div>
  );
};

export default MultiDriveFileManager;