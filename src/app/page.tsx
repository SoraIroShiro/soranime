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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <Navbar/>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[70vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
            }}
          ></div>
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/40 to-purple-900/40"></div>
          {/* Additional Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 sm:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
              Selamat Datang di SorAnime
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 mb-8 drop-shadow-lg">
              Jelajahi koleksi anime terbaik dengan kualitas streaming terdepan
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 px-6 py-3 rounded-full backdrop-blur-sm shadow-2xl">
                <span className="text-cyan-400 font-semibold">{animes.length} Anime Tersedia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anime Grid Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400">
              Latest Anime Collection
            </h2>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>Recently Updated</span>
            </div>
          </div>
          
          {animes.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {animes.map((anime) => (
                <AnimeCard key={anime._id} anime={anime} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Anime Available</h3>
              <p className="text-gray-400 mb-6">
                We&apos;re working hard to bring you the best anime content. Check back soon!
              </p>
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse mr-3"></div>
                <span className="text-cyan-400 font-medium">Loading new content...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}