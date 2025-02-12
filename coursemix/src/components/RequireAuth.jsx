import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/Spinner';

const RequireAuth = ({ children }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/signin');
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setIsAuthenticated(false);
        router.push('/signin');
      } else {
        setIsAuthenticated(true);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default RequireAuth; 