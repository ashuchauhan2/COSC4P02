import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const RequireAuth = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin'); // Redirect to sign-in page if not authenticated
      }
    };

    checkUser();
  }, [router]);

  return children; // Render children if authenticated
};

export default RequireAuth; 