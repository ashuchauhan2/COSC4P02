'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Spinner from '@/components/Spinner';

export default function ClientLayout({ children }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsTransitioning(true);
    // Reset after transition
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {isTransitioning && <Spinner />}
        {children}
      </main>
      <Footer />
    </div>
  );
} 