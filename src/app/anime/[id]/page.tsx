import Image from 'next/image';
import EpisodePlayer from '@/components/EpisodePlayer'; // <-- 1. Impor komponen baru

// Tipe data untuk episode dan detail anime
interface Episode {
  episodeNumber: number;
  googleDriveLink: string;
  _id: string;
}

interface AnimeDetails {
  _id: string;
  title: string;
  synopsis: string;
  posterImage: string;
  genres: string[];
  rating: number;
  status: 'Finished' | 'Airing';
  episodes: Episode[];
}

// Fungsi untuk mengambil data detail dari API
async function getAnimeDetails(id: string): Promise<AnimeDetails | null> {
  try {
    const res = await fetch(`http://localhost:5000/api/animes/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Komponen halaman detail
export default async function AnimeDetailPage({ params }: { params: { id: string } }) {

  const anime = await getAnimeDetails(params.id);
  if (!anime) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Anime tidak ditemukan.</div>;
  }

  // Fungsi untuk validasi URL gambar
  const isValidUrl = (url: string) => url && (url.startsWith('http://') || url.startsWith('https://'));

  // --- Client Component untuk preview episode ---
  // Gunakan React hook untuk state episode yang sedang dipreview
  // Karena file ini async, perlu wrapper client component
  //
  // Komponen Client
  //
  // File: EpisodePreviewClient.tsx
  //
  // import { useState } from 'react';
  // import EpisodePlayer from '@/components/EpisodePlayer';
  //
  // export default function EpisodePreviewClient({ episodes }: { episodes: Episode[] }) {
  //   const [currentIdx, setCurrentIdx] = useState(0);
  //   return (
  //     <>
  //       <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 mb-6">
  //         {episodes.map((episode, idx) => (
  //           <button
  //             key={episode._id}
  //             onClick={() => setCurrentIdx(idx)}
  //             className={`flex items-center justify-center rounded p-3 text-center transition font-semibold ${currentIdx === idx ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-cyan-500'}`}
  //           >
  //             {episode.episodeNumber}
  //           </button>
  //         ))}
  //       </div>
  //       <EpisodePlayer link={episodes[currentIdx].googleDriveLink} />
  //     </>
  //   );
  // }

  // --- End Client Component ---

  // Import komponen client dengan dynamic import
  const DynamicEpisodePreviewClient = (await import('next/dynamic')).default(() => import('@/components/EpisodePreviewClient'), { ssr: false });

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Kolom Poster */}
          <div className="md:col-span-1">
            {isValidUrl(anime.posterImage) ? (
              <Image
                src={anime.posterImage}
                alt={`Poster for ${anime.title}`}
                width={500}
                height={700}
                className="w-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-[450px] w-full items-center justify-center rounded-lg bg-gray-700 text-sm text-gray-400">
                Gambar tidak tersedia
              </div>
            )}
          </div>

          {/* Kolom Detail */}
          <div className="md:col-span-2">
            <h1 className="mb-2 text-3xl font-bold sm:text-4xl">{anime.title}</h1>
            <div className="mb-4 flex items-center space-x-4 text-sm text-gray-400">
              <span>⭐ {anime.rating}</span>
              <span>•</span>
              <span>{anime.status}</span>
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <span key={genre} className="rounded-full bg-gray-700 px-3 py-1 text-xs">
                  {genre}
                </span>
              ))}
            </div>
            <h2 className="mb-2 text-xl font-semibold">Sinopsis</h2>
            <p className="mb-8 text-gray-300">{anime.synopsis}</p>

            {/* Daftar Episode */}
            <h2 className="mb-4 text-xl font-semibold">Episode</h2>
            {/* Tombol episode dan preview video */}
            <DynamicEpisodePreviewClient episodes={anime.episodes} />
          </div>
        </div>
      </div>
    </main>
  );
}