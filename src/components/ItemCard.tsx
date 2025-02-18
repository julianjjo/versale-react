// src/components/ItemCard.tsx

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ClothingItem } from '../types';
import { supabase } from '../lib/supabase';

interface ItemCardProps {
  item: ClothingItem;
  addToCart: (item: ClothingItem) => void;
}

export function ItemCard({ item, addToCart }: ItemCardProps) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleCardClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent navigation if clicking on favorite or add to cart buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/product/${item.id}`);
  };

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
    <div
      className={`relative outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 rounded-xl ${
        item.stock > 0 ? 'cursor-pointer hover:shadow-lg' : 'opacity-75'
      }`}
      onClick={item.stock > 0 ? handleCardClick : undefined}
      onKeyDown={item.stock > 0 ? (e) => e.key === 'Enter' && handleCardClick(e) : undefined}
      role="button"
      tabIndex={item.stock > 0 ? 0 : -1}
      aria-label={`Ver detalles de ${item.title}${item.stock === 0 ? ' - Vendido' : ''}`}
    >
      {error && (
        <div className="absolute -top-2 left-0 right-0 z-10 mx-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="relative aspect-[4/5] group">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}
          <img
            src={item.images[0]}
            alt={item.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`absolute top-3 right-3 p-3 sm:p-2.5 rounded-full shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] ${
              isFavorite
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-white/90 backdrop-blur-sm text-indigo-600 hover:bg-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Heart
              className={`h-6 w-6 sm:h-5 sm:w-5 transition-colors duration-300 ${
                isFavorite ? 'fill-current' : 'hover:fill-current'
              }`}
            />
          </button>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-2">
              {item.title}
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-indigo-600 ml-4">
              ${item.price.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
            <span className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
              {item.size}
            </span>
            <span className="px-3 py-1.5 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
              {item.condition}
            </span>
            {item.stock === 0 && (
              <span className="px-3 py-1.5 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Vendido
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(item)}
            disabled={item.stock === 0}
            className={`w-full mt-3 inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 min-h-[44px] ${
              item.stock > 0
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
            }`}
          >
            {item.stock > 0 ? 'Agregar al Carrito' : 'Vendido'}
          </button>
        </div>
      </div>
    </div>
  );
}