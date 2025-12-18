'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getAuthToken } from '@/lib/auth';
import AnimeForm from '@/components/admin/AnimeForm';

interface Anime {
  _id: string;
  title: string;
  synopsis: string;
  posterImage: string;
  genres: string[];
  rating: number;
  status: string;
  episodes: Array<{
    _id: string;
    episodeNumber: number;
    googleDriveLink: string;
  }>;
}

export default function AdminDashboard() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedAnime, setExpandedAnime] = useState<string | null>(null);

  useEffect(() => {
    fetchAnimes();
    
    // Debug: Check token on component mount
    const token = getAuthToken();
    if (token) {
      try {
        // Decode token to check its contents
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Token expires at:', new Date(payload.exp * 1000));
        console.log('Current time:', new Date());
        
        if (payload.exp * 1000 < Date.now()) {
          console.warn('Token expired');
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
        }
      } catch (e) {
        console.error('Invalid token format:', e);
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
    } else {
      console.warn('No token found');
    }
  }, []);

  const fetchAnimes = async () => {
    try {
      const res = await fetch('/api/animes');
      const data = await res.json();
      setAnimes(data);
    } catch (error) {
      console.error('Error fetching animes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnime = async (id: string) => {
    if (!confirm('Yakin ingin menghapus anime ini?')) return;
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        alert('No authentication token found. Please login again.');
        window.location.href = '/admin/login';
        return;
      }
      
      const res = await fetch(`/api/animes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (res.status === 401) {
        alert('Authentication failed. Please login again.');
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
        return;
      }
      
      if (res.ok) {
        setAnimes(animes.filter(anime => anime._id !== id));
        alert('Anime berhasil dihapus');
      } else {
        alert('Gagal menghapus anime');
      }
    } catch (error) {
      console.error('Error deleting anime:', error);
      alert('Gagal menghapus anime');
    }
  };

  const toggleEpisodeDetails = (animeId: string) => {
    setExpandedAnime(expandedAnime === animeId ? null : animeId);
  };

  const handleAddAnime = async (formData: {
    title: string;
    synopsis: string;
    posterImage: string;
    genres: string[];
    rating: number;
    status: string;
    episodes: Array<{
      episodeNumber: number;
      googleDriveLink: string;
    }>;
  }) => {
    try {
      console.log('Form data received:', formData);
      
      const token = getAuthToken();
      
      if (!token) {
        alert('No authentication token found. Please login again.');
        window.location.href = '/admin/login';
        return;
      }
      
      console.log('Sending request to /api/animes with token:', token);
      
      const res = await fetch('/api/animes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      if (res.status === 401) {
        alert('Authentication failed. Please login again.');
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
        return;
      }
      
      if (res.ok) {
        const newAnime = await res.json();
        console.log('Successfully added anime:', newAnime);
        setAnimes([...animes, newAnime]);
        setShowAddForm(false);
        alert('🎉 Anime berhasil ditambahkan!');
      } else {
        const errorData = await res.json();
        console.error('Server error:', errorData);
        alert(`Gagal menambahkan anime: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding anime:', error);
      alert(`Gagal menambahkan anime: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">🎌 Dashboard Admin</h1>
          <p className="text-gray-400 mt-1">Kelola anime dengan AniList integration</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          {showAddForm ? '✕ Cancel' : '➕ Tambah Anime'}
        </button>
      </div>

      {/* Add Anime Form */}
      {showAddForm && (
        <div className="mb-8">
          <AnimeForm 
            onSubmit={handleAddAnime}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-2">Total Anime</h3>
          <p className="text-2xl font-bold text-white">{animes.length}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-2">Airing</h3>
          <p className="text-2xl font-bold text-green-400">
            {animes.filter(anime => anime.status === 'Airing').length}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-2">Finished</h3>
          <p className="text-2xl font-bold text-blue-400">
            {animes.filter(anime => anime.status === 'Finished').length}
          </p>
        </div>
      </div>

      {/* Anime Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-white font-medium">Poster</th>
                <th className="px-6 py-4 text-left text-white font-medium">Title</th>
                <th className="px-6 py-4 text-left text-white font-medium">Rating</th>
                <th className="px-6 py-4 text-left text-white font-medium">Status</th>
                <th className="px-6 py-4 text-left text-white font-medium">Episodes</th>
                <th className="px-6 py-4 text-left text-white font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {animes.map((anime, index) => (
                <React.Fragment key={anime._id}>
                  <tr className={`border-b border-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}>
                  <td className="px-6 py-4">
                    <Image 
                      src={anime.posterImage} 
                      alt={anime.title}
                      width={48}
                      height={64}
                      className="w-12 h-16 object-cover rounded border border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium max-w-xs truncate">{anime.title}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {anime.genres?.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">⭐</span>
                      <span className="text-white">{anime.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      anime.status === 'Finished' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-yellow-600 text-white'
                    }`}>
                      {anime.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleEpisodeDetails(anime._id)}
                      className="flex items-center text-white hover:text-cyan-400 transition-colors"
                    >
                      <span className="mr-2">{anime.episodes?.length || 0} Episodes</span>
                      <span className="text-sm">
                        {expandedAnime === anime._id ? '🔽' : '▶️'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => deleteAnime(anime._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedAnime === anime._id && (
                  <tr className="bg-gray-900">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="bg-gray-750 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-3 flex items-center">
                          📺 Episodes - {anime.title}
                        </h4>
                        {anime.episodes && anime.episodes.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                            {anime.episodes
                              .sort((a, b) => a.episodeNumber - b.episodeNumber)
                              .map((episode, episodeIndex) => (
                              <div 
                                key={episodeIndex} 
                                className="bg-gray-800 rounded p-3 border border-gray-600"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="text-white font-medium">
                                      Episode {episode.episodeNumber.toString().replace('.', ',')}
                                    </p>
                                    <p className="text-gray-400 text-sm mt-1 truncate">
                                      {episode.googleDriveLink}
                                    </p>
                                  </div>
                                  <div className="flex space-x-2 ml-3">
                                    <a
                                      href={episode.googleDriveLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                                    >
                                      🔗 Open
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-gray-400 text-4xl mb-2">📽️</div>
                            <p className="text-gray-400">Belum ada episode untuk anime ini</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {animes.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4 text-6xl">📺</div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">Belum ada anime</h3>
            <p className="text-gray-400 mb-6">Tambahkan anime pertama dengan tombol di atas</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              ➕ Tambah Anime Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}