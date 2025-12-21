import Image from 'next/image';

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
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/animes/${id}`, { cache: 'no-store' });
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
export default async function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const anime = await getAnimeDetails(resolvedParams.id);
  if (!anime) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Anime tidak ditemukan.</div>;
  }

  // Fungsi untuk validasi URL gambar
  const isValidUrl = (url: string) => url && (url.startsWith('http://') || url.startsWith('https://'));

  
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
                width={300}
                height={400}
                className="rounded-lg object-cover"
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