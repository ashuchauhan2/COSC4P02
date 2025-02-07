'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Spinner from '@/components/Spinner';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </>
      )}
    </div>
  );
} 