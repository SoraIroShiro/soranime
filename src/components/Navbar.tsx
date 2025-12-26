"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  _id: string;
  title: string;
  posterImage: string;
  genres?: string[];
}

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle search
  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/animes`);
      if (response.ok) {
        const animes: SearchResult[] = await response.json();
        const filteredResults = animes.filter(anime =>
          anime.title.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filteredResults.slice(0, 5)); // Limit to 5 results
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle result click
  const handleResultClick = (animeId: string) => {
    setSearchQuery('');
    setShowResults(false);
    router.push(`/anime/${animeId}`);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-gray-900/50 backdrop-blur-md border-b border-gray-700/30 px-6 py-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/logo/soranime_logo1.png"
            alt="SORANIME"
            width={200}
            height={32}
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        
        {/* Right side - Searchbox & Admin Button */}
        <div className="flex items-center space-x-6">
          {/* Searchbox */}
          <div ref={searchRef} className="hidden sm:block relative">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  placeholder="Search anime..."
                  className="w-64 pl-10 pr-4 py-2.5 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                />
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-md border border-gray-600/30 rounded-xl shadow-2xl z-50 overflow-hidden">
                {searchResults.map((anime) => (
                  <div
                    key={anime._id}
                    onClick={() => handleResultClick(anime._id)}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-700/50 cursor-pointer transition-colors duration-200 border-b border-gray-700/30 last:border-b-0"
                  >
                    <div className="w-12 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                      {anime.posterImage && (anime.posterImage.startsWith('http://') || anime.posterImage.startsWith('https://')) ? (
                        <Image
                          src={anime.posterImage}
                          alt={anime.title}
                          width={48}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          🎭
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{anime.title}</p>
                      {anime.genres && anime.genres.length > 0 && (
                        <p className="text-gray-400 text-sm truncate">
                          {anime.genres.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {showResults && searchResults.length === 0 && !isSearching && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-md border border-gray-600/30 rounded-xl shadow-2xl z-50 p-4 text-center">
                <div className="text-gray-400">
                  <div className="text-2xl mb-2">🔍</div>
                  <p className="text-sm">No anime found for &quot;{searchQuery}&quot;</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Admin Login Button */}
          <Link 
            href="/admin/login"
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 border border-cyan-500/30 hover:border-cyan-400/50 text-white px-4 py-2.5 rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm group"
          >
            <div className="relative">
              <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold transition-transform duration-300 group-hover:rotate-12">
                A
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>
            </div>
            <span className="hidden md:inline text-sm font-medium group-hover:text-cyan-400 transition-colors duration-300">Admin</span>
          </Link>

          {/* Mobile Search Button */}
          <button
            onClick={() => setShowResults(!showResults)}
            className="sm:hidden p-2.5 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Mobile Search Overlay */}
        {showResults && (
          <div className="sm:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/30 p-4">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  placeholder="Search anime..."
                  className="w-full pl-10 pr-4 py-3 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                  autoFocus
                />
              </div>
            </form>

            {/* Mobile Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-xl overflow-hidden">
                {searchResults.map((anime) => (
                  <div
                    key={anime._id}
                    onClick={() => handleResultClick(anime._id)}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-700/50 cursor-pointer transition-colors duration-200 border-b border-gray-700/30 last:border-b-0"
                  >
                    <div className="w-12 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                      {anime.posterImage && (anime.posterImage.startsWith('http://') || anime.posterImage.startsWith('https://')) ? (
                        <Image
                          src={anime.posterImage}
                          alt={anime.title}
                          width={48}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          🎭
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{anime.title}</p>
                      {anime.genres && anime.genres.length > 0 && (
                        <p className="text-gray-400 text-sm truncate">
                          {anime.genres.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mobile No Results */}
            {searchResults.length === 0 && !isSearching && searchQuery.trim().length >= 2 && (
              <div className="mt-4 bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-4 text-center">
                <div className="text-gray-400">
                  <div className="text-2xl mb-2">🔍</div>
                  <p className="text-sm">No anime found for &quot;{searchQuery}&quot;</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}