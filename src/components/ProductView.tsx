import React, { useState, useEffect } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ClothingItem, User } from '../types';
import { supabase } from '../lib/supabase';

interface ProductViewProps {
  item: ClothingItem;
  addToCart: (item: ClothingItem) => void;
}

export function ProductView({ item, addToCart }: ProductViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkIfFavorite();
      }
    });
    
    // Fetch seller information
    fetchSellerInfo();
  }, [item.id]);

  const fetchSellerInfo = async () => {
    try {
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', item.sellerId)
        .single();

      if (error) throw error;
      setSeller(userData);
    } catch (error) {
      console.error('Error fetching seller info:', error);
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
      const { data: { user } } = await supabase.auth.getUser();

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
    <div className="container mx-auto px-4 pt-20 sm:pt-16 pb-8">
      {error && (
        <div className="mb-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-w-4 aspect-h-5 relative rounded-lg overflow-hidden bg-gray-100">
            <img
              src={item.images[currentImageIndex]}
              alt={item.title}
              className="object-cover w-full h-full"
            />
            {item.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {item.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {item.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`aspect-square rounded-lg overflow-hidden ${
                  currentImageIndex === index ? 'ring-2 ring-indigo-600' : ''
                }`}
              >
                <img src={image} alt={`${item.title} ${index + 1}`} className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
            <button
              onClick={toggleFavorite}
              disabled={loading}
              className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
                isFavorite
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-white text-indigo-600 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="flex items-baseline space-x-4">
            <p className="text-3xl font-bold text-indigo-600">
              ${item.price.toLocaleString()}
            </p>
            <div className="flex space-x-2">
              <span className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
                {item.size}
              </span>
              <span className="px-3 py-1.5 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                {item.condition}
              </span>
              <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                item.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.stock > 0 ? `${item.stock} disponibles` : 'Vendido'}
              </span>
              {item.category && (
                <span className="px-3 py-1.5 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                  {item.category.name}
                </span>
              )}
            </div>
          </div>

          <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>

          {seller && (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendedor</h2>
              <div className="flex items-center space-x-4">
                {seller.avatar && (
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">{seller.name}</p>
                  <div className="flex items-center space-x-1 text-amber-500">
                    <span className="text-sm">★ {seller.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => addToCart(item)}
                disabled={item.stock <= 0}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  item.stock > 0
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                }`}
              >
                {item.stock > 0 ? 'Agregar al Carrito' : 'Vendido'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}