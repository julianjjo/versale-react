import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AuthProps {
  onSuccess?: () => void;
}

export function Auth({ onSuccess }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        // Registro
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        const user = data.user;
        if (user) {
          // Asignar rol 'user'
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{ user_id: user.id, role: 'user' }]);
          if (roleError) throw roleError;
        }

        if (onSuccess) onSuccess();
        navigate('/');
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (onSuccess) onSuccess();
        navigate('/');
      }
    } catch (err) {
      console.error('Error durante la autenticación:', err);
      setError(err instanceof Error ? err.message : JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 
        Ajustamos un 'padding-top' para compensar el header de ~64px (4rem). 
        Y definimos una altura mínima 'calc(100vh - 4rem)' 
        para que, si no hay mucho contenido, no aparezca scroll. 
      */}
      <div className="pt-16 min-h-[calc(100vh-4rem)] flex items-center justify-center bg-white">
        <div className="max-w-md w-full bg-white p-8 rounded-md shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">
            {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2
                          focus:outline-none focus:ring-2 focus:ring-indigo-500
                          focus:border-indigo-500"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2
                          focus:outline-none focus:ring-2 focus:ring-indigo-500
                          focus:border-indigo-500"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* Botón principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 rounded-md shadow-sm
                        text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
                        focus:outline-none focus:ring-2 focus:ring-indigo-500
                        focus:ring-offset-2 disabled:opacity-60"
            >
              {loading
                ? 'Cargando...'
                : mode === 'login'
                ? 'Iniciar Sesión'
                : 'Registrarse'}
            </button>
          </form>

          {/* Links extras */}
          <div className="mt-4 text-center space-y-3">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {mode === 'login'
                ? '¿No tienes cuenta? Regístrate'
                : '¿Ya tienes cuenta? Inicia Sesión'}
            </button>

            {mode === 'login' && (
              <div>
                <Link
                  to="/reset-password"
                  className="block text-sm font-medium text-indigo-600 hover:text-indigo-500 mt-2"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}