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
    <Link href={`/anime/${anime._id}`} className="group block overflow-hidden h-[370px] w-[225px] rounded-lg">
      <div className="relative h-[320px] w-[225px] bg-gray-800 overflow-hidden">
        {/* Lakukan pengecekan di sini */}
        {isValidUrl(anime.posterImage) ? (
          // JIKA URL VALID: Tampilkan gambar
          <Image
            src={anime.posterImage}
            alt={`Poster for ${anime.title}`}
            fill
            sizes="320px"
            className="object-cover transition-transform duration-600 group-hover:scale-105"
          />
        ) : (
          // JIKA URL TIDAK VALID: Tampilkan placeholder
          <div className="flex h-full w-full items-center justify-center bg-gray-700 text-sm text-gray-400">
            <p>Gambar tidak ada</p>
          </div>
        )}
      </div>
      <div className="bg-gray-800 p-3">
        <h3 className="truncate text-sm font-semibold text-white group-hover:text-cyan-400 text-center">
          {anime.title}
        </h3>
      </div>
    </Link>
  );
}