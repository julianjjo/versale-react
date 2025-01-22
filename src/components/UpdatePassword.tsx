import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function UpdatePassword() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const { error: supabaseError } = await supabase.auth.updateUser({
        password,
      });

      if (supabaseError) {
        throw supabaseError;
      }

      setSuccess(true);
      setPassword(''); // Limpiar el campo después del éxito
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Restablecer Contraseña</h2>
        {success && (
          <div className="mb-4 transform transition-all duration-500 ease-in-out translate-y-0 opacity-100">
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>¡Contraseña actualizada exitosamente!</span>
            </div>
          </div>
        )}
        <form className="space-y-6" onSubmit={handleUpdatePassword}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Nueva Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Restablecer Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}