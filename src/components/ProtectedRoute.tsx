import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAllowed(false);
          setLoading(false);
          return;
        }

        if (requireAdmin) {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);

          if (error) throw error;

          const userRole = data?.[0]?.role;
          setIsAllowed(userRole === 'admin');
        } else {
          setIsAllowed(true);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setIsAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [requireAdmin]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}