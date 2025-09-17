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
          width={250} // atur lebar logo agar memanjang
          height={35} // tinggi tetap agar proporsional
          className="mr-2 object-contain"
        />
      </Link>
      {/* Searchbox */}
      <form className="flex-1 max-w-xs">
        <input
          type="text"
          placeholder="Cari anime..."
          className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </form>
    </nav>
  );
}