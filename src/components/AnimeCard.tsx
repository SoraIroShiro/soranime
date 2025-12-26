import Image from 'next/image';
import Link from 'next/link';

// Definisikan tipe data untuk prop yang diterima komponen ini
interface Anime {
  _id: string;
  title: string;
  posterImage: string;
}

interface Props {
  anime: Anime;
}

export default function AnimeCard({ anime }: Props) {
  // Fungsi kecil untuk memeriksa apakah string adalah URL yang valid
  const isValidUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  return (
    <Link href={`/anime/${anime._id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 hover:border-cyan-500/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10">
        {/* Poster Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {isValidUrl(anime.posterImage) ? (
            <Image
              src={anime.posterImage}
              alt={`Poster for ${anime.title}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 text-gray-400">
              <div className="text-center">
                <div className="text-3xl mb-2">🎭</div>
                <p className="text-xs">No Image</p>
              </div>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Hover Play Icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-full p-3">
              <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors duration-300 text-center line-clamp-1">
            {anime.title}
          </h3>
        </div>

        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300 -z-10"></div>
      </div>
    </Link>
  );
}