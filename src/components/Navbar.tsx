import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="w-full bg-gray-900 px-6 mb-4 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="ml-4 flex items-center">
        <Image
          src="/logo/soranime_logo1.png"
          alt="SORANIME"
          width={250}
          height={35}
          className="mr-2 object-contain"
        />
      </Link>
      
      {/* Right side - Searchbox & Admin Button */}
      <div className="flex items-center space-x-4">
        {/* Searchbox */}
        <form className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Cari anime..."
            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </form>
        
        {/* Admin Login Button with Avatar */}
        <Link 
          href="/admin/login"
          className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 border border-gray-600 hover:border-cyan-500"
        >
          <Image
            src="/login-avatar.png"
            alt="Admin Login"
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="text-sm font-medium">Admin</span>
        </Link>
      </div>
    </nav>
  );
}