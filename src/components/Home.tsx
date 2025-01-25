// src/components/Home.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ItemCard } from './ItemCard';
import type { ClothingItem } from '../types';
import { AdminDashboard } from './AdminDashboard';

interface HomeProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  isAdmin: boolean;
  addToCart: (item: ClothingItem) => void;
}

export function Home({
  searchQuery,
  setSearchQuery,
  isAdmin,
  addToCart
}: HomeProps): JSX.Element {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('is_published', true)
        .ilike('title', `%${searchQuery}%`);

      if (error) {
        console.error('Error al obtener artículos:', error);
      } else {
        setItems(data || []);
      }

      setLoading(false);
    };

    fetchItems();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-gray-500 text-base sm:text-lg md:text-xl">Cargando...</span>
      </div>
    );
  }

  return (
    // Usar padding-top para compensar el Header fijo
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 pt-20 sm:pt-16">
      {isAdmin ? (
        // SI ES ADMIN: muestra solo el dashboard
        <AdminDashboard />
      ) : (
        // SI NO ES ADMIN: muestra la lista de ítems
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              addToCart={addToCart}
            />
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-12">
              <span className="text-gray-500 text-base sm:text-lg md:text-xl">
                No se encontraron artículos
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}