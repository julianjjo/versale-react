import React, { useState, useEffect } from 'react';
import { Heart, CheckCircle, XCircle } from 'lucide-react';
import type { ClothingItem } from '../types';
import { supabase } from '../lib/supabase';

interface ItemCardProps {
  item: ClothingItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkIfFavorite();
    checkIfAdmin();
  }, [item.id]);

  const checkIfAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please sign in to favorite items');
        return;
      }

      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', item.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([
            { user_id: user.id, item_id: item.id }
          ]);

        if (error) throw error;
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('items')
        .update({ is_published: !item.isPublished })
        .eq('id', item.id);

      if (error) throw error;
      window.location.reload();
    } catch (error) {
      console.error('Error toggling published status:', error);
      alert('Failed to update published status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="relative aspect-square">
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <button 
          onClick={toggleFavorite}
          disabled={loading}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-colors ${
            isFavorite 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        {isAdmin && (
          <button
            onClick={togglePublished}
            disabled={loading}
            className={`absolute top-2 left-2 p-2 rounded-full shadow-md transition-colors ${
              item.isPublished
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            {item.isPublished ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
        <p className="text-xl font-bold text-indigo-600">${item.price}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-500">{item.size}</span>
          <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
            {item.condition}
          </span>
        </div>
        {!item.isPublished && (
          <div className="mt-2 text-sm text-gray-500 italic">
            Pending approval
          </div>
        )}
      </div>
    </div>
  );
}