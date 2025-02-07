"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LandingPage from '@/components/LandingPage';
import Spinner from '@/components/Spinner';
export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push('/protected/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <Spinner />
  }

  return <LandingPage />;
}