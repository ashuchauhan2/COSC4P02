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

  return (
    <div className="min-h-screen">
      {isLoading ? (
        <div className="relative z-10">
          <Spinner />
        </div>
      ) : null}
      <div className={isLoading ? 'opacity-50' : ''}>
        {isAuthenticated ? children : null}
      </div>
    </div>
  );
};

export default RequireAuth; 