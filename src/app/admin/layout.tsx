'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      
      if (!authenticated && pathname !== '/admin/login') {
        router.push('/admin/login');
        return;
      }
      
      if (authenticated && pathname === '/admin/login') {
        router.push('/admin/dashboard');
        return;
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {pathname !== '/admin/login' && (
        <nav className="bg-gray-800 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-white text-xl font-bold">Admin Panel</h1>
            <button
              onClick={() => {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </nav>
      )}
      {children}
    </div>
  );
}
