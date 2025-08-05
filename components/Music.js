import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useSpotify } from '../hooks/useSpotify';
import Image from 'next/image';
import { Play, Heart, MoreHorizontal, User, LogOut } from 'lucide-react';

const Music = () => {
  const { data: session, status } = useSession();
  const { userPlaylists, recentTracks, topTracks } = useSpotify();
  const [activeTab, setActiveTab] = useState('recent');

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 text-white">
        <div className="px-6 pt-20 pb-32">
          <div className="text-center">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-black font-bold text-2xl">♪</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Connect to Spotify</h1>
            <p className="text-gray-400 text-lg mb-8">
              Access your playlists, recently played, and discover new music
            </p>
            <button
              onClick={() => signIn('spotify')}
              className="bg-green-500 hover:bg-green-600 text-black font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
            >
              Connect Spotify Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'recent', label: 'Recently Played', emoji: '🕒' },
    { id: 'top', label: 'Your Top Tracks', emoji: '⭐' },
    { id: 'playlists', label: 'Your Playlists', emoji: '📚' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 text-white">
      {/* Header */}
      <div className="px-6 pt-16 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Image
              src={session.user.image || '/default-avatar.png'}
              alt="Profile"
              width={60}
              height={60}
              className="rounded-full"
            />
            <div>
              <h1 className="text-3xl font-bold">Welcome back!</h1>
              <p className="text-green-400 text-lg">{session.user.name}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="p-3 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all duration-300"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-green-500 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-32">
        {activeTab === 'recent' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
            {recentTracks.map((item, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-4">
                  <Image
                    src={item.track.album.images[0]?.url || '/default-album.png'}
                    alt={item.track.name}
                    width={60}
                    height={60}
                    className="rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{item.track.name}</h3>
                    <p className="text-gray-400">{item.track.artists[0].name}</p>
                    <p className="text-xs text-gray-500">{item.track.album.name}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 hover:bg-white/10 rounded-full">
                      <Heart size={18} />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full">
                      <Play size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'top' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Your Top Tracks</h2>
            {topTracks.map((track, index) => (
              <div key={track.id} className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
                    {index + 1}
                  </div>
                  <Image
                    src={track.album.images[0]?.url || '/default-album.png'}
                    alt={track.name}
                    width={60}
                    height={60}
                    className="rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{track.name}</h3>
                    <p className="text-gray-400">{track.artists[0].name}</p>
                    <p className="text-xs text-gray-500">Popularity: {track.popularity}/100</p>
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-full">
                    <Play size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div className="grid grid-cols-2 gap-4">
            <h2 className="col-span-2 text-2xl font-bold mb-4">Your Playlists</h2>
            {userPlaylists.map((playlist) => (
              <div key={playlist.id} className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/10 transition-colors cursor-pointer">
                <Image
                  src={playlist.images[0]?.url || '/default-playlist.png'}
                  alt={playlist.name}
                  width={120}
                  height={120}
                  className="rounded-lg mb-3 w-full aspect-square object-cover"
                />
                <h3 className="font-semibold text-white text-sm line-clamp-2">{playlist.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{playlist.tracks.total} songs</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Music;
