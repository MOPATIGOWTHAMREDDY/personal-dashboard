import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export const useSpotify = () => {
  const { data: session } = useSession();
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [topTracks, setTopTracks] = useState([]);

  const fetchWithAuth = async (url) => {
    if (!session?.accessToken) return null;
    
    const response = await fetch(`https://api.spotify.com/v1${url}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    
    if (response.ok) {
      return response.json();
    }
    return null;
  };

  const getUserPlaylists = async () => {
    const data = await fetchWithAuth('/me/playlists?limit=20');
    if (data) setUserPlaylists(data.items);
  };

  const getRecentTracks = async () => {
    const data = await fetchWithAuth('/me/player/recently-played?limit=20');
    if (data) setRecentTracks(data.items);
  };

  const getTopTracks = async () => {
    const data = await fetchWithAuth('/me/top/tracks?limit=20&time_range=short_term');
    if (data) setTopTracks(data.items);
  };

  useEffect(() => {
    if (session?.accessToken) {
      getUserPlaylists();
      getRecentTracks();
      getTopTracks();
    }
  }, [session]);

  return {
    session,
    userPlaylists,
    recentTracks,
    topTracks,
    fetchWithAuth,
  };
};
