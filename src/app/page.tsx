import AnimeCard from '@/components/AnimeCard';
import Navbar from '@/components/Navbar';

// Definisikan tipe data untuk objek anime dari API
interface Anime {
  _id: string;
  title: string;
  posterImage: string;
  synopsis?: string;
  genres?: string[];
  rating?: number;
  status?: string;
}

// Fungsi untuk mengambil SEMUA data anime (bukan satu anime)
async function getAnimes(): Promise<Anime[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/animes`, { 
      cache: 'no-store',
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      console.error('Fetch error:', res.status, res.statusText);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    return [];
  }
}

export default async function HomePage() {
  const animes = await getAnimes();

  return (
    <main className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <Navbar/>
      <div className="container mx-auto">
        <h1 className="mb-8 text-2xl font-bold text-white sm:text-3xl">
          Anime Terbaru
        </h1>
        
        {animes.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {animes.map((anime) => (
              <AnimeCard key={anime._id} anime={anime} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">Gagal memuat anime atau tidak ada data.</p>
        )}
      </div>
    </main>
  );
}