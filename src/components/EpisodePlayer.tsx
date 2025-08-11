"use client"; // <-- Menandakan ini adalah Client Component yang interaktif

import { useState, useEffect } from 'react';

// Definisikan tipe data untuk episode
interface Episode {
  _id: string;
  episodeNumber: number;
  googleDriveLink: string;
}

// Definisikan tipe untuk props yang diterima dari page.tsx
interface Props {
  episodes: Episode[];
}

export default function EpisodePlayer({ episodes }: Props) {
  // State untuk menyimpan URL episode yang sedang dipilih
  const [selectedEpisodeUrl, setSelectedEpisodeUrl] = useState('');

  // Atur episode pertama sebagai default saat komponen pertama kali dimuat
  useEffect(() => {
    if (episodes && episodes.length > 0) {
      setSelectedEpisodeUrl(episodes[0].googleDriveLink);
    }
  }, [episodes]);

  // Fungsi untuk mengubah video saat tombol episode diklik
  const handleEpisodeClick = (url: string) => {
    setSelectedEpisodeUrl(url);
  };

  // Fungsi untuk mengubah link Google Drive menjadi link embed untuk iframe
  const getEmbedLink = (gdriveLink: string) => {
    if (!gdriveLink) return '';
    // Mencari ID file dari berbagai format URL Google Drive
    const fileIdMatch = gdriveLink.match(/d\/(.*?)(?:\/view|\?|$)/);
    return (fileIdMatch && fileIdMatch[1]) ? `https://drive.google.com/file/d/${fileIdMatch[1]}/preview` : '';
  };
  
  // Jika tidak ada episode, jangan tampilkan apa-apa
  if (!episodes || episodes.length === 0) {
    return <p className="text-gray-400">Tidak ada episode yang tersedia.</p>;
  }

  return (
    <div>
      {/* Daftar Episode (sebelumnya ada di page.tsx) */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {episodes.map((episode) => (
          <button
            key={episode._id}
            onClick={() => handleEpisodeClick(episode.googleDriveLink)}
            // Beri warna berbeda untuk episode yang sedang aktif dan cursor pointer
            className={`flex items-center justify-center rounded p-3 text-center transition cursor-pointer ${getEmbedLink(selectedEpisodeUrl) === getEmbedLink(episode.googleDriveLink) ? 'bg-cyan-500' : 'bg-gray-700 hover:bg-cyan-600'}`}
          >
            {episode.episodeNumber}
          </button>
        ))}
      </div>

      {/* Pemutar Video (Iframe) */}
      {selectedEpisodeUrl && (
        <div className="mt-6 aspect-video w-full">
          <iframe
            key={selectedEpisodeUrl} // <-- Key penting agar iframe me-reload saat src berubah
            src={getEmbedLink(selectedEpisodeUrl)}
            width="100%"
            height="100%"
            allow="autoplay; fullscreen"
            className="rounded-lg border-0"
          ></iframe>
        </div>
      )}
    </div>
  );
}