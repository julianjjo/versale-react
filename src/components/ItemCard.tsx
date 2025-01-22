// src/components/ItemCard.tsx

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import type { ClothingItem } from '../types';
import { supabase } from '../lib/supabase';

interface ItemCardProps {
  item: ClothingItem;
  addToCart: (item: ClothingItem) => void; // <-- nueva prop
}

export function ItemCard({ item, addToCart }: ItemCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkIfFavorite();
      }
    });
  }, [item.id]);

  const checkIfFavorite = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', item.id);

      if (!error && data) {
        setIsFavorite(data.length > 0);
      }
    } catch (error) {
      console.error('Error al verificar favorito:', error);
    }
  };

  const toggleFavorite = async () => {
    setError(null);

    if (!session) {
      setError('Por favor, inicia sesión para marcar artículos como favoritos');
      return;
    }

    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Por favor, inicia sesión para marcar artículos como favoritos');
        return;
      }

      if (isFavorite) {
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', item.id);

        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, item_id: item.id }]);

        if (insertError) throw insertError;
      }

      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error al alternar favorito:', err);
      setError('No se pudo actualizar el estado de favorito. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {error && (
        <div className="absolute -top-2 left-0 right-0 z-10 mx-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="relative aspect-square group">
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`absolute top-3 right-3 p-2.5 rounded-full shadow-lg transition-all duration-300 ${
              isFavorite
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-white/90 backdrop-blur-sm text-indigo-600 hover:bg-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Heart
              className={`h-5 w-5 transition-colors duration-300 ${
                isFavorite ? 'fill-current' : 'hover:fill-current'
              }`}
            />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {item.title}
            </h3>
            <p className="text-xl font-bold text-indigo-600 ml-4">
              ${item.price.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
              {item.size}
            </span>
            <span className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
              {item.condition}
            </span>
          </div>

          {/* Botón para agregar al carrito */}
          <button
            onClick={() => addToCart(item)}
            className="mt-2 inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
}