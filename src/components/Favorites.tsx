// src/components/Favorites.tsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { ClothingItem } from '../types';

export function Favorites(): JSX.Element {
  const { userId } = useAuth();
  const [favorites, setFavorites] = useState<ClothingItem[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('favorites')
        .select('item:items(*)')
        .eq('user_id', userId);

      if (error) {
        console.error('Error al obtener favoritos:', error);
        return;
      }

      if (data) {
        const mapped = data.map((row: any) => ({
          ...row.item,
        })) as ClothingItem[];
        setFavorites(mapped);
      }
    };

    fetchFavorites();
  }, [userId]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Mis Favoritos</h2>
      {favorites.length === 0 ? (
        <p>No tienes artículos favoritos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favorites.map((item) => (
            <div key={item.id} className="bg-gray-100 p-4 rounded-lg shadow">
              <img
                src={item.images[0]}
                alt={item.title}
                className="h-40 w-full object-cover rounded-md"
              />
              <div className="mt-4">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-500 capitalize">{item.category}</p>
                <p className="text-gray-900 font-bold mt-1">${item.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}