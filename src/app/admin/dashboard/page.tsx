'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getAuthToken } from '@/lib/auth';

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
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);
  const [expandedAnime, setExpandedAnime] = useState<string | null>(null);
  const [previewEpisode, setPreviewEpisode] = useState<{
    animeTitle: string;
    episodeNumber: number;
    googleDriveLink: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    posterImage: '',
    genres: '',
    rating: 0,
    status: 'Airing'
  });
  const [episodeData, setEpisodeData] = useState({
    episodeNumber: 1,
    googleDriveLink: ''
  });
  const [formEpisodes, setFormEpisodes] = useState<Array<{
    episodeNumber: number;
    googleDriveLink: string;
  }>>([]);

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
      const res = await fetch(`/api/animes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        setAnimes(animes.filter(anime => anime._id !== id));
        alert('Anime berhasil dihapus');
      }
    } catch (error) {
      console.error('Error deleting anime:', error);
      alert('Gagal menghapus anime');
    }
  };

  const addEpisodeToForm = () => {
    if (episodeData.episodeNumber && episodeData.googleDriveLink) {
      setFormEpisodes([...formEpisodes, {
        episodeNumber: episodeData.episodeNumber,
        googleDriveLink: episodeData.googleDriveLink
      }]);
      setEpisodeData({
        episodeNumber: episodeData.episodeNumber + 1,
        googleDriveLink: ''
      });
    }
  };

  const removeEpisodeFromForm = (indexToRemove: number) => {
    setFormEpisodes(formEpisodes.filter((_, index) => index !== indexToRemove));
  };

  const openEditForm = (anime: Anime) => {
    setEditingAnime(anime);
    setFormData({
      title: anime.title,
      synopsis: anime.synopsis,
      posterImage: anime.posterImage,
      genres: anime.genres.join(', '),
      rating: anime.rating,
      status: anime.status
    });
    setFormEpisodes(anime.episodes.map(ep => ({
      episodeNumber: ep.episodeNumber,
      googleDriveLink: ep.googleDriveLink
    })));
    setEpisodeData({
      episodeNumber: anime.episodes.length + 1,
      googleDriveLink: ''
    });
    setShowAddForm(false); // Close add form if open
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAnime) return;
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        alert('No authentication token found. Please login again.');
        window.location.href = '/admin/login';
        return;
      }
      
      const res = await fetch(`/api/animes/${editingAnime._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          genres: formData.genres.split(',').map(g => g.trim()),
          episodes: formEpisodes
        }),
      });
      
      if (res.status === 401) {
        alert('Authentication failed. Please login again.');
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
        return;
      }
      
      if (res.ok) {
        const updatedAnime = await res.json();
        setAnimes(animes.map(anime => 
          anime._id === editingAnime._id ? updatedAnime : anime
        ));
        setEditingAnime(null);
        setFormData({
          title: '',
          synopsis: '',
          posterImage: '',
          genres: '',
          rating: 0,
          status: 'Airing'
        });
        setFormEpisodes([]);
        setEpisodeData({
          episodeNumber: 1,
          googleDriveLink: ''
        });
        alert('Anime berhasil diupdate');
      } else {
        const errorData = await res.json();
        alert(`Gagal mengupdate anime: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating anime:', error);
      alert('Terjadi kesalahan saat mengupdate anime');
    }
  };

  const cancelEdit = () => {
    setEditingAnime(null);
    setFormData({
      title: '',
      synopsis: '',
      posterImage: '',
      genres: '',
      rating: 0,
      status: 'Airing'
    });
    setFormEpisodes([]);
    setEpisodeData({
      episodeNumber: 1,
      googleDriveLink: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        alert('No authentication token found. Please login again.');
        window.location.href = '/admin/login';
        return;
      }
      
      console.log('Submitting with token:', token ? 'Token exists' : 'No token');
      
      const res = await fetch('/api/animes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          genres: formData.genres.split(',').map(g => g.trim()),
          episodes: formEpisodes
        }),
      });
      
      console.log('Response status:', res.status);
      
      if (res.status === 401) {
        alert('Authentication failed. Please login again.');
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
        return;
      }
      
      if (res.ok) {
        const newAnime = await res.json();
        setAnimes([...animes, newAnime]);
        setFormData({
          title: '',
          synopsis: '',
          posterImage: '',
          genres: '',
          rating: 0,
          status: 'Airing'
        });
        setFormEpisodes([]);
        setEpisodeData({
          episodeNumber: 1,
          googleDriveLink: ''
        });
        setShowAddForm(false);
        alert('Anime berhasil ditambahkan');
      } else {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        alert(`Gagal menambahkan anime: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding anime:', error);
      alert('Terjadi kesalahan saat menambahkan anime');
    }
  };

  const deleteEpisode = async (animeId: string, episodeId: string) => {
    if (!confirm('Yakin ingin menghapus episode ini?')) return;
    
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/animes/${animeId}/episodes/${episodeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const updatedAnime = await res.json();
        setAnimes(animes.map(anime => 
          anime._id === animeId ? updatedAnime : anime
        ));
        alert('Episode berhasil dihapus');
      }
    } catch (error) {
      console.error('Error deleting episode:', error);
      alert('Gagal menghapus episode');
    }
  };

  const openEpisodePreview = (animeTitle: string, episodeNumber: number, googleDriveLink: string) => {
    setPreviewEpisode({
      animeTitle,
      episodeNumber,
      googleDriveLink
    });
  };

  const convertToEmbedLink = (googleDriveLink: string) => {
    // Convert Google Drive link to embed format
    // From: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    // To: https://drive.google.com/file/d/FILE_ID/preview
    const fileIdMatch = googleDriveLink.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return googleDriveLink;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard Admin</h1>
        <div className="space-x-2">
          <button
            onClick={() => {
              if (editingAnime) {
                cancelEdit();
              } else {
                setShowAddForm(!showAddForm);
              }
            }}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            {editingAnime ? 'Cancel Edit' : (showAddForm ? 'Cancel' : 'Tambah Anime')}
          </button>
        </div>
      </div>

      {(showAddForm || editingAnime) && (
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingAnime ? 'Edit Anime' : 'Tambah Anime Baru'}
          </h2>
          <form onSubmit={editingAnime ? handleEditSubmit : handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 bg-gray-700 text-white rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Synopsis</label>
              <textarea
                value={formData.synopsis}
                onChange={(e) => setFormData({...formData, synopsis: e.target.value})}
                className="w-full p-3 bg-gray-700 text-white rounded h-24"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Poster Image URL</label>
              <input
                type="url"
                value={formData.posterImage}
                onChange={(e) => setFormData({...formData, posterImage: e.target.value})}
                className="w-full p-3 bg-gray-700 text-white rounded"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Genres (comma separated)</label>
                <input
                  type="text"
                  value={formData.genres}
                  onChange={(e) => setFormData({...formData, genres: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded"
                  placeholder="Action, Drama, Comedy"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Rating</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                  className="w-full p-3 bg-gray-700 text-white rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-3 bg-gray-700 text-white rounded"
              >
                <option value="Airing">Airing</option>
                <option value="Finished">Finished</option>
              </select>
            </div>
            
            {/* Episode Management Section */}
            <div className="border-t border-gray-600 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Episodes</h3>
              
              {/* Add Episode Form */}
              <div className="bg-gray-700 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Episode Number</label>
                    <input
                      type="number"
                      min="1"
                      value={episodeData.episodeNumber}
                      onChange={(e) => setEpisodeData({...episodeData, episodeNumber: parseInt(e.target.value)})}
                      className="w-full p-3 bg-gray-600 text-white rounded"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setEpisodeData({...episodeData, episodeNumber: Math.max(1, episodeData.episodeNumber - 1)})}
                      className="bg-gray-600 text-white px-3 py-3 rounded-l hover:bg-gray-500"
                    >
                      -
                    </button>
                    <div className="bg-gray-600 text-white px-4 py-3 text-center min-w-[60px]">
                      {episodeData.episodeNumber}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEpisodeData({...episodeData, episodeNumber: episodeData.episodeNumber + 1})}
                      className="bg-gray-600 text-white px-3 py-3 rounded-r hover:bg-gray-500"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Google Drive Link</label>
                  <input
                    type="url"
                    value={episodeData.googleDriveLink}
                    onChange={(e) => setEpisodeData({...episodeData, googleDriveLink: e.target.value})}
                    className="w-full p-3 bg-gray-600 text-white rounded"
                    placeholder="Masukkan link Google Drive"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={addEpisodeToForm}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  + Add Episode to List
                </button>
              </div>
              
              {/* Episode List */}
              {formEpisodes.length > 0 && (
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <h4 className="text-white font-medium mb-3">Episodes to be added ({formEpisodes.length}):</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {formEpisodes.map((episode, index) => (
                      <div key={index} className="bg-gray-600 p-3 rounded flex justify-between items-center">
                        <div className="text-white text-sm">
                          <span className="font-medium">Episode {episode.episodeNumber}</span>
                          <br />
                          <span className="text-gray-300 text-xs truncate block max-w-[200px]">
                            {episode.googleDriveLink}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEpisodeFromForm(index)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                          title="Remove Episode"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              {editingAnime ? 'Update Anime' : 'Tambah Anime'}
            </button>
          </form>
        </div>
      )}

      {/* Episode Preview Modal */}
      {previewEpisode && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  {previewEpisode.animeTitle} - Episode {previewEpisode.episodeNumber}
                </h2>
                <button
                  onClick={() => setPreviewEpisode(null)}
                  className="text-white hover:text-red-400 text-2xl font-bold"
                  title="Close Preview"
                >
                  ×
                </button>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="aspect-video w-full bg-black rounded">
                  <iframe
                    src={convertToEmbedLink(previewEpisode.googleDriveLink)}
                    className="w-full h-full rounded"
                    allowFullScreen
                    title={`${previewEpisode.animeTitle} Episode ${previewEpisode.episodeNumber}`}
                  />
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">
                      Original Link:
                    </span>
                    <a 
                      href={previewEpisode.googleDriveLink}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 text-sm"
                    >
                      Open in New Tab
                    </a>
                  </div>
                  
                  <div className="bg-gray-700 p-2 rounded text-xs text-gray-300 break-all">
                    {previewEpisode.googleDriveLink}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setPreviewEpisode(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-white">Poster</th>
                <th className="px-6 py-3 text-left text-white">Title</th>
                <th className="px-6 py-3 text-left text-white">Rating</th>
                <th className="px-6 py-3 text-left text-white">Status</th>
                <th className="px-6 py-3 text-left text-white">Episodes</th>
                <th className="px-6 py-3 text-left text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {animes.map((anime) => (
                <>
                  <tr key={anime._id} className="border-b border-gray-700">
                    <td className="px-6 py-4">
                      <Image 
                        src={anime.posterImage} 
                        alt={anime.title}
                        width={48}
                        height={64}
                        className="w-12 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-white max-w-xs truncate">{anime.title}</td>
                    <td className="px-6 py-4 text-white">{anime.rating}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        anime.status === 'Finished' ? 'bg-green-600' : 'bg-yellow-600'
                      } text-white`}>
                        {anime.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">{anime.episodes?.length || 0}</td>
                    <td className="px-6 py-4">
                      <div className="space-x-2">
                        <button 
                          onClick={() => openEditForm(anime)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteAnime(anime._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                        {anime.episodes && anime.episodes.length > 0 && (
                          <button 
                            onClick={() => setExpandedAnime(expandedAnime === anime._id ? null : anime._id)}
                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                          >
                            {expandedAnime === anime._id ? 'Hide' : 'View'} Episodes
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Episode List untuk anime ini */}
                  {expandedAnime === anime._id && anime.episodes && anime.episodes.length > 0 && (
                    <tr className="bg-gray-750">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="space-y-2">
                          <h4 className="text-white font-semibold">Episodes ({anime.episodes.length}):</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                            {(() => {
                              // Sort episodes by episode number for consistent order
                              const sortedEpisodes = [...anime.episodes].sort((a, b) => a.episodeNumber - b.episodeNumber);
                              
                              // Calculate episodes per column for vertical ordering
                              const totalEpisodes = sortedEpisodes.length;
                              const columns = 3; // lg:grid-cols-3
                              const episodesPerColumn = Math.ceil(totalEpisodes / columns);
                              
                              // Create array with proper vertical ordering
                              const reorderedEpisodes = [];
                              
                              // Fill by columns (vertical ordering)
                              for (let row = 0; row < episodesPerColumn; row++) {
                                for (let col = 0; col < columns; col++) {
                                  const index = col * episodesPerColumn + row;
                                  if (index < totalEpisodes) {
                                    reorderedEpisodes.push(sortedEpisodes[index]);
                                  }
                                }
                              }
                              
                              return reorderedEpisodes.map((episode) => (
                                <div key={episode._id} className="bg-gray-600 p-3 rounded flex justify-between items-center">
                                  <div className="text-white text-sm flex-1">
                                    <span className="font-medium">Episode {episode.episodeNumber}</span>
                                    <br />
                                    <a 
                                      href={episode.googleDriveLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-cyan-400 hover:text-cyan-300 text-xs truncate block max-w-[150px]"
                                      title={episode.googleDriveLink}
                                    >
                                      View Link
                                    </a>
                                  </div>
                                  <div className="flex space-x-1 ml-2">
                                    <button
                                      onClick={() => openEpisodePreview(anime.title, episode.episodeNumber, episode.googleDriveLink)}
                                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                      title="Preview Episode"
                                    >
                                      👁️
                                    </button>
                                    <button
                                      onClick={() => deleteEpisode(anime._id, episode._id)}
                                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                      title="Delete Episode"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {animes.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            Belum ada anime yang ditambahkan
          </div>
        )}
      </div>
    </div>
  );
}
