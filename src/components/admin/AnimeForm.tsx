"use client";
import { useState, useEffect } from "react";
import {
  searchAnimeByTitle,
  cleanDescription,
  getPreferredTitle,
} from "@/lib/anilist";

interface AnimeFormData {
  title: string;
  synopsis: string;
  posterImage: string;
  bannerImage: string;
  genres: string[];
  rating: number;
  status: string;
  studios: string[];
  streamingEpisodes: Array<{
    title: string;
    thumbnail: string;
    url: string;
    site: string;
  }>;
  episodes: Array<{
    episodeNumber: number;
    googleDriveLink: string;
  }>;
}

interface AnimeFormProps {
  onSubmit: (formData: AnimeFormData) => void;
  onCancel: () => void;
  initialData?: AnimeFormData;
}

interface AniListAnime {
  id: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  description?: string;
  coverImage: {
    large?: string;
    medium?: string;
  };
  bannerImage?: string;
  genres?: string[];
  averageScore?: number;
  status?: string;
  studios?: {
    nodes: Array<{
      name: string;
    }>;
  };
  streamingEpisodes?: Array<{
    title: string;
    thumbnail: string;
    url: string;
    site: string;
  }>;
}

export default function AnimeForm({
  onSubmit,
  onCancel,
  initialData,
}: AnimeFormProps) {
  const [formData, setFormData] = useState<AnimeFormData>(
    initialData || {
      title: "",
      synopsis: "",
      posterImage: "",
      bannerImage: "",
      genres: [],
      rating: 0,
      status: "Airing",
      studios: [],
      streamingEpisodes: [],
      episodes: [],
    }
  );

  const [newEpisode, setNewEpisode] = useState<{
    episodeNumber: string;
    driveLink: string;
  }>({
    episodeNumber: "",
    driveLink: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<AniListAnime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Episode management functions
  const addEpisode = () => {
    const raw = newEpisode.episodeNumber.trim().replace(",", ".");
    const num = parseFloat(raw);

    if (!newEpisode.episodeNumber.trim()) {
      alert("Nomor episode tidak boleh kosong");
      return;
    }

    if (isNaN(num) || !isFinite(num)) {
      alert("Nomor episode tidak valid. Gunakan angka, contoh: 12 atau 12,5");
      return;
    }

    if (!newEpisode.driveLink.trim()) {
      alert("Link Google Drive tidak boleh kosong");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      episodes: [
        ...prev.episodes,
        {
          episodeNumber: num,
          googleDriveLink: newEpisode.driveLink.trim(),
        },
      ],
    }));

    // Auto-increment nomor episode untuk input berikutnya
    const nextEpisode = (num + 1).toString().replace(".", ",");
    setNewEpisode({ episodeNumber: nextEpisode, driveLink: "" });
  };

  const removeEpisode = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      episodes: prev.episodes.filter((_, i) => i !== index),
    }));
  };

  // Debounced search function
  const handleSearch = (term: string) => {
    setSearchTerm(term);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!term.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchAnimeByTitle(term);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms delay

    setSearchTimeout(timeout);
  };

  // Auto-fill form when user selects anime
  const selectAnime = (anime: AniListAnime) => {
    const cleanedDescription = cleanDescription(anime.description);
    const preferredTitle = getPreferredTitle(anime.title);

    // Preserve episodes - jangan overwrite episodes yang sudah ada
    const currentEpisodes = formData.episodes; // Simpan episodes yang sudah ada

    // Manipulasi URL untuk mendapatkan gambar large yang sebenarnya
    const getBestImage = () => {
      const largeUrl = anime.coverImage.large || "";
      const mediumUrl = anime.coverImage.medium || "";

      

      // Coba ubah path medium menjadi large di URL
      if (largeUrl && largeUrl.includes("/medium/")) {
        const actualLargeUrl = largeUrl.replace("/medium/", "/large/");
        console.log("Generated Large URL:", actualLargeUrl);
        return actualLargeUrl;
      }

      // Fallback: coba dari medium URL
      if (mediumUrl && mediumUrl.includes("/small/")) {
        const actualLargeUrl = mediumUrl.replace("/small/", "/large/");
        console.log("Generated Large URL from medium:", actualLargeUrl);
        return actualLargeUrl;
      }

      // Fallback terakhir
      return largeUrl || mediumUrl || "";
    };

    setFormData((prev) => ({
      title: preferredTitle,
      synopsis: cleanedDescription,
      posterImage: getBestImage(),
      bannerImage: anime.bannerImage || "",
      genres: anime.genres || [],
      rating: anime.averageScore
        ? Math.round((anime.averageScore / 10) * 10) / 10
        : 0,
      status: anime.status === "FINISHED" ? "Finished" : "Airing",
      studios: anime.studios?.nodes?.map(studio => studio.name) || [],
      streamingEpisodes: anime.streamingEpisodes || [],
      episodes: currentEpisodes, // 🎯 Tetap gunakan episodes yang sudah ada, JANGAN overwrite
    }));

    setShowResults(false);
    setSearchResults([]);
    setSearchTerm("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);

    // Basic validation
    if (!formData.title.trim()) {
      alert("Judul tidak boleh kosong");
      return;
    }
    if (!formData.synopsis.trim()) {
      alert("Synopsis tidak boleh kosong");
      return;
    }
    if (!formData.posterImage.trim()) {
      alert("Poster image URL tidak boleh kosong");
      return;
    }

    onSubmit(formData);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-6">Tambah Anime Baru</h2>

      {/* AniList Search Box */}
      <div className="mb-6 relative">
        <label className="block text-gray-300 mb-2">
          🔍 Cari di AniList untuk Auto-Fill (Opsional)
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Ketik judul anime (misal: Attack on Titan, Naruto, dll)..."
          className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />

        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute top-full left-0 right-0 bg-gray-700 p-4 rounded-b z-10 border border-gray-600">
            <p className="text-white">🔎 Searching AniList...</p>
          </div>
        )}

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-gray-700 max-h-80 overflow-y-auto rounded-b z-20 border border-gray-600 shadow-lg">
            {searchResults.map((anime: AniListAnime) => (
              <div
                key={anime.id}
                onClick={() => selectAnime(anime)}
                className="p-4 hover:bg-gray-600 cursor-pointer border-b border-gray-600 flex items-start space-x-3 transition-colors"
              >
                <img
                  src={anime.coverImage.large || "/placeholder.jpg"}
                  alt={getPreferredTitle(anime.title)}
                  className="w-12 h-16 object-cover rounded flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">
                    {getPreferredTitle(anime.title)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {anime.genres?.slice(0, 3).join(", ")} • Score:{" "}
                    {anime.averageScore}/100
                  </p>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                    {cleanDescription(anime.description)?.substring(0, 100)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results message */}
        {showResults &&
          searchResults.length === 0 &&
          !isSearching &&
          searchTerm && (
            <div className="absolute top-full left-0 right-0 bg-gray-700 p-4 rounded-b z-10 border border-gray-600">
              <p className="text-gray-400">
                Tidak ada hasil untuk &ldquo;{searchTerm}&rdquo;
              </p>
            </div>
          )}
      </div>

      {/* Manual Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Rating (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.rating}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rating: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Poster Image URL *</label>
          <input
            type="url"
            value={formData.posterImage}
            onChange={(e) =>
              setFormData({ ...formData, posterImage: e.target.value })
            }
            className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
          {formData.posterImage && (
            <div className="mt-3">
              <p className="text-gray-400 text-sm mb-2">Preview:</p>
              <img
                src={formData.posterImage}
                alt="Preview"
                className="w-24 h-32 object-cover rounded border border-gray-600"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = "block";
                }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Banner Image URL (Optional)</label>
          <input
            type="url"
            value={formData.bannerImage}
            onChange={(e) =>
              setFormData({ ...formData, bannerImage: e.target.value })
            }
            className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="https://example.com/banner.jpg"
          />
          {formData.bannerImage && (
            <div className="mt-3">
              <p className="text-gray-400 text-sm mb-2">Banner Preview:</p>
              <img
                src={formData.bannerImage}
                alt="Banner Preview"
                className="w-full h-20 object-cover rounded border border-gray-600"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = "block";
                }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Studios (Auto-filled from AniList)</label>
          <input
            type="text"
            value={formData.studios.join(", ")}
            onChange={(e) =>
              setFormData({ 
                ...formData, 
                studios: e.target.value.split(",").map(s => s.trim()).filter(s => s.length > 0)
              })
            }
            className="w-full p-3 bg-gray-600 text-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Studio Pierrot, Madhouse"
            readOnly={formData.studios.length > 0}
          />
          {formData.studios.length > 0 && (
            <div className="mt-2">
              <p className="text-gray-400 text-sm">Studios from AniList:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.studios.map((studio, index) => (
                  <span key={index} className="bg-purple-600 text-white px-2 py-1 rounded text-sm">
                    {studio}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Streaming Episodes Preview */}
        {formData.streamingEpisodes.length > 0 && (
          <div>
            <label className="block text-gray-300 mb-2">
              Streaming Episodes (Preview from AniList) - {formData.streamingEpisodes.length} episodes
            </label>
            <div className="bg-gray-700 p-4 rounded border border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                {formData.streamingEpisodes.slice(0, 6).map((episode, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-600 p-2 rounded">
                    <img
                      src={episode.thumbnail || "/placeholder.jpg"}
                      alt={episode.title}
                      className="w-12 h-8 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.jpg";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {episode.title}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {episode.site}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {formData.streamingEpisodes.length > 6 && (
                <p className="text-gray-400 text-sm mt-2 text-center">
                  ... and {formData.streamingEpisodes.length - 6} more episodes
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                ℹ️ This is preview data from AniList. Use the manual episode section below to add your Google Drive links.
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-gray-300 mb-2">Synopsis *</label>
          <textarea
            value={formData.synopsis}
            onChange={(e) =>
              setFormData({ ...formData, synopsis: e.target.value })
            }
            rows={4}
            className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Deskripsi singkat tentang anime..."
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Genres</label>
          <input
            type="text"
            value={formData.genres.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                genres: e.target.value
                  .split(",")
                  .map((g) => g.trim())
                  .filter((g) => g),
              })
            }
            className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Action, Adventure, Drama (pisahkan dengan koma)"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Episodes</label>
          <div className="bg-gray-700 rounded p-4">
            <div className="grid grid-cols-1 gap-3 mb-4">
              <div className="space-y-2">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Episode # (contoh: 12 atau 12,5)"
                  value={newEpisode.episodeNumber}
                  onChange={(e) =>
                    setNewEpisode({
                      ...newEpisode,
                      episodeNumber: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="url"
                  placeholder="Google Drive Link"
                  value={newEpisode.driveLink}
                  onChange={(e) =>
                    setNewEpisode({ ...newEpisode, driveLink: e.target.value })
                  }
                  className="w-full p-2 bg-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={addEpisode}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200 font-medium cursor-pointer transform hover:scale-105"
                >
                  ➕ Tambah Episode & Lanjut ke Berikutnya
                </button>
              </div>
            </div>

            {formData.episodes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-gray-300 font-medium">Episodes List:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {formData.episodes.map((episode, index) => (
                    <div
                      key={index}
                      className="bg-gray-600 p-2 rounded flex justify-between items-center"
                    >
                      <span className="text-white">
                        Episode{" "}
                        {episode.episodeNumber.toString().replace(".", ",")}:{" "}
                        {episode.googleDriveLink}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEpisode(index)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200 cursor-pointer hover:bg-red-900 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="Airing">Airing</option>
            <option value="Finished">Finished</option>
          </select>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors duration-200 font-medium cursor-pointer transform hover:scale-105"
          >
            💾 Simpan Anime
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 transition-colors duration-200 cursor-pointer transform hover:scale-105"
          >
            ✕ Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
