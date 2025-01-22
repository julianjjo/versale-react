// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  userId: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
  loadingAuth: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  userId: '',
  isLoggedIn: false,
  isAdmin: false,
  loadingAuth: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const fetchOrCreateAnonId = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          if (error.message.includes('Auth session missing')) {
            // Anónimo
            let anonId = localStorage.getItem('anonId');
            if (!anonId) {
              anonId = crypto.randomUUID();
              localStorage.setItem('anonId', anonId);
            }
            setUserId(anonId);
            setIsLoggedIn(false);
            setIsAdmin(false);
            setLoadingAuth(false);
            return;
          }
          throw error;
        }

        if (user) {
          // Registrado
          setUserId(user.id);
          setIsLoggedIn(true);

          // verificar rol en user_roles
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (!roleError && roleData?.role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          // Anónimo
          let anonId = localStorage.getItem('anonId');
          if (!anonId) {
            anonId = crypto.randomUUID();
            localStorage.setItem('anonId', anonId);
          }
          setUserId(anonId);
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoadingAuth(false);
      }
    };

    fetchOrCreateAnonId();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userId,
        isLoggedIn,
        isAdmin,
        loadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}