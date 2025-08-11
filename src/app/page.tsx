import AnimeCard from '@/components/AnimeCard';

// Definisikan tipe data untuk objek anime dari API
interface Anime {
  _id: string;
  title: string;
  posterImage: string;
}

// Fungsi untuk mengambil data anime
async function getAnimes(): Promise<Anime[]> {
  try {
    const res = await fetch('http://localhost:5000/api/animes', {
      // cache: 'no-store' akan membuat data selalu baru setiap kali halaman dikunjungi
      // 'force-cache' (default) akan membuat data di-cache selamanya
      cache: 'no-store', 
    });

    if (!res.ok) {
      throw new Error('Gagal mengambil data dari API');
    }
    
    return res.json();
  } catch (error) {
    console.error(error);
    return []; // Kembalikan array kosong jika terjadi error
  }
}

export default async function HomePage() {
  const animes = await getAnimes();

  return (
    <main className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
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