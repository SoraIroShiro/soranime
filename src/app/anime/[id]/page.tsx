import Image from 'next/image';
import { getAnimeByAniListId } from '@/lib/anilist';

// Tipe data untuk episode dan detail anime
interface Episode {
  episodeNumber: number;
  googleDriveLink: string;
  _id: string;
}

interface AniListCharacter {
  role: string;
  node: {
    name: {
      full: string;
    };
    image: {
      medium: string;
    };
  };
}

interface AniListStaff {
  role: string;
  node: {
    name: {
      full: string;
    };
  };
}

interface AniListData {
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
  format?: string;
  episodes?: number;
  duration?: number;
  studios?: {
    nodes: Array<{
      name: string;
    }>;
  };
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  endDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  season?: string;
  externalLinks?: Array<{
    url: string;
    site: string;
  }>;
  characters?: {
    edges: AniListCharacter[];
  };
  staff?: {
    edges: AniListStaff[];
  };
  trailer?: {
    id: string;
    site: string;
    thumbnail: string;
  };
}

interface AnimeDetails {
  _id: string;
  anilistId?: number;
  title: string;
  synopsis: string;
  posterImage: string;
  bannerImage?: string;
  genres: string[];
  rating: number;
  status: 'Finished' | 'Airing';
  studios?: string[];
  streamingEpisodes?: Array<{
    title: string;
    thumbnail: string;
    url: string;
    site: string;
  }>;
  episodes: Episode[];
}

// Fungsi untuk mengambil data detail dari API
async function getAnimeDetails(id: string): Promise<{anime: AnimeDetails | null, anilistData: AniListData | null}> {
  try {
    // Ambil data anime dari database
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/animes/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      return { anime: null, anilistData: null };
    }
    
    const anime: AnimeDetails = await res.json();
    
    // Jika ada anilistId, ambil data detail dari AniList
    let anilistData: AniListData | null = null;
    if (anime.anilistId) {
      try {
        anilistData = await getAnimeByAniListId(anime.anilistId);
      } catch (error) {
        console.error('Error fetching AniList data:', error);
      }
    }
    
    return { anime, anilistData };
  } catch (error) {
    console.error(error);
    return { anime: null, anilistData: null };
  }
}

// Komponen halaman detail
export default async function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { anime, anilistData } = await getAnimeDetails(resolvedParams.id);
  
  if (!anime) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold mb-2">Anime tidak ditemukan</h1>
          <p className="text-gray-400">ID yang Anda cari mungkin tidak valid atau anime telah dihapus.</p>
        </div>
      </div>
    );
  }

  // Helper functions
  const isValidUrl = (url: string) => url && (url.startsWith('http://') || url.startsWith('https://'));
  
  const formatDate = (dateObj?: { year?: number; month?: number; day?: number }) => {
    if (!dateObj || !dateObj.year) return 'Unknown';
    const { year, month, day } = dateObj;
    if (month && day) {
      return new Date(year, month - 1, day).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return year.toString();
  };

  const getPreferredTitle = (titles?: { romaji?: string; english?: string; native?: string }) => {
    return titles?.english || titles?.romaji || titles?.native || anime.title;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;
  };

  
  // Import komponen client dengan dynamic import
  const DynamicEpisodePreviewClient = (await import('next/dynamic')).default(() => import('@/components/EpisodePreviewClient'), { ssr: false });

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Hero Section dengan Banner */}
      {anilistData?.bannerImage && (
        <div className="relative h-80 md:h-96 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <Image
            src={anilistData.bannerImage}
            alt={`Banner for ${anime.title}`}
            fill
            className="object-cover"
          />
          <div className="relative z-20 flex items-end h-full container mx-auto px-4">
            <div className="pb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-2 drop-shadow-lg">
                {getPreferredTitle(anilistData?.title)}
              </h1>
              <div className="flex items-center space-x-4 text-lg">
                <span className="bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
                  ⭐ {anilistData?.averageScore ? (anilistData.averageScore / 10).toFixed(1) : anime.rating}
                </span>
                <span className="bg-blue-600 px-3 py-1 rounded-full">
                  {anilistData?.status || anime.status}
                </span>
                {anilistData?.format && (
                  <span className="bg-purple-600 px-3 py-1 rounded-full">
                    {anilistData.format}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Poster dan Info */}
          <div className="lg:col-span-1">
            {/* Poster */}
            <div className="sticky top-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6">
                {isValidUrl(anilistData?.coverImage?.large || anime.posterImage) ? (
                  <Image
                    src={anilistData?.coverImage?.large || anime.posterImage}
                    alt={`Poster for ${anime.title}`}
                    width={300}
                    height={450}
                    className="w-full rounded-xl object-cover shadow-2xl"
                  />
                ) : (
                  <div className="aspect-[2/3] w-full flex items-center justify-center rounded-xl bg-gray-700 text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎭</div>
                      <p>No Image</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Info Cards */}
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="font-bold text-cyan-400 mb-3">Information</h3>
                  <div className="space-y-2 text-sm">
                    {anilistData?.studios?.nodes && anilistData.studios.nodes.length > 0 && (
                      <div>
                        <span className="text-gray-400">Studio:</span>
                        <p className="text-white font-medium">
                          {anilistData.studios.nodes.map(s => s.name).join(', ')}
                        </p>
                      </div>
                    )}
                    {anilistData?.format && (
                      <div>
                        <span className="text-gray-400">Format:</span>
                        <p className="text-white font-medium">{anilistData.format}</p>
                      </div>
                    )}
                    {anilistData?.episodes && (
                      <div>
                        <span className="text-gray-400">Episodes:</span>
                        <p className="text-white font-medium">{anilistData.episodes}</p>
                      </div>
                    )}
                    {anilistData?.duration && (
                      <div>
                        <span className="text-gray-400">Duration:</span>
                        <p className="text-white font-medium">{formatDuration(anilistData.duration)}</p>
                      </div>
                    )}
                    {anilistData?.season && (
                      <div>
                        <span className="text-gray-400">Season:</span>
                        <p className="text-white font-medium">
                          {anilistData.season} {anilistData.startDate?.year}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                {(anilistData?.startDate || anilistData?.endDate) && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
                    <h3 className="font-bold text-cyan-400 mb-3">Dates</h3>
                    <div className="space-y-2 text-sm">
                      {anilistData?.startDate && (
                        <div>
                          <span className="text-gray-400">Start Date:</span>
                          <p className="text-white font-medium">{formatDate(anilistData.startDate)}</p>
                        </div>
                      )}
                      {anilistData?.endDate && (
                        <div>
                          <span className="text-gray-400">End Date:</span>
                          <p className="text-white font-medium">{formatDate(anilistData.endDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* External Links */}
                {anilistData?.externalLinks && anilistData.externalLinks.length > 0 && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
                    <h3 className="font-bold text-cyan-400 mb-3">Links</h3>
                    <div className="space-y-2">
                      {anilistData.externalLinks.slice(0, 3).map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          🔗 {link.site}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!anilistData?.bannerImage && (
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {getPreferredTitle(anilistData?.title)}
                </h1>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
                    ⭐ {anilistData?.averageScore ? (anilistData.averageScore / 10).toFixed(1) : anime.rating}
                  </span>
                  <span className="bg-blue-600 px-3 py-1 rounded-full">
                    {anilistData?.status || anime.status}
                  </span>
                  {anilistData?.format && (
                    <span className="bg-purple-600 px-3 py-1 rounded-full">
                      {anilistData.format}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Alternative Titles */}
            {anilistData?.title && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold text-cyan-400 mb-4">Titles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {anilistData.title.romaji && (
                    <div>
                      <span className="text-gray-400">Romaji:</span>
                      <p className="text-white font-medium">{anilistData.title.romaji}</p>
                    </div>
                  )}
                  {anilistData.title.english && (
                    <div>
                      <span className="text-gray-400">English:</span>
                      <p className="text-white font-medium">{anilistData.title.english}</p>
                    </div>
                  )}
                  {anilistData.title.native && (
                    <div>
                      <span className="text-gray-400">Native:</span>
                      <p className="text-white font-medium">{anilistData.title.native}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Genres */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {(anilistData?.genres || anime.genres).map((genre) => (
                  <span
                    key={genre}
                    className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Synopsis */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed">
                {anilistData?.description?.replace(/<[^>]*>/g, '') || anime.synopsis}
              </p>
            </div>

            {/* Trailer */}
            {anilistData?.trailer && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">Trailer</h2>
                <div className="aspect-video rounded-xl overflow-hidden">
                  {anilistData.trailer.site === 'youtube' ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${anilistData.trailer.id}`}
                      title="Anime Trailer"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <p className="text-gray-400">Trailer not available</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Characters */}
            {anilistData?.characters?.edges && anilistData.characters.edges.length > 0 && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">Characters</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {anilistData.characters.edges.slice(0, 8).map((char, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-3 text-center hover:bg-gray-600/50 transition-colors">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden bg-gray-600">
                        {char.node.image?.medium ? (
                          <Image
                            src={char.node.image.medium}
                            alt={char.node.name.full}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            👤
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-white truncate">{char.node.name.full}</p>
                      <p className="text-xs text-cyan-400">{char.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staff */}
            {anilistData?.staff?.edges && anilistData.staff.edges.length > 0 && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">Staff</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {anilistData.staff.edges
                    .filter(staff => ['Director', 'Original Creator', 'Music', 'Character Design'].includes(staff.role))
                    .slice(0, 6)
                    .map((staff, index) => (
                      <div key={index} className="bg-gray-700/30 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-white font-medium">{staff.node.name.full}</span>
                        <span className="text-cyan-400 text-sm">{staff.role}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Episodes */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">Episodes ({anime.episodes.length})</h2>
              <DynamicEpisodePreviewClient episodes={anime.episodes} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}