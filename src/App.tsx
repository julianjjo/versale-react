import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ItemCard } from './components/ItemCard';
import { SellItemForm } from './components/SellItemForm';
import { Auth } from './components/Auth';
import { X } from 'lucide-react';
import type { ClothingItem } from './types';
import { supabase } from './lib/supabase';

export default function App() {
  const [showSellForm, setShowSellForm] = useState(false);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [session, setSession] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, sortBy, searchQuery]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('items')
        .select('*');

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedCategory && selectedCategory !== 'All Categories') {
        query = query.eq('category', selectedCategory);
      }

      switch (sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        default: // latest
          query = query.order('created_at', { ascending: false });
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      setItems(data as ClothingItem[]);
      setError(null);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const CATEGORIES = [
    'All Categories',
    'Dresses',
    'Tops',
    'Bottoms',
    'Outerwear',
    'Shoes',
    'Accessories',
    'Other'
  ];

  const handleSellClick = () => {
    if (!session) {
      alert('Please sign in to list items');
      return;
    }
    setShowSellForm(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSellClick={handleSellClick} onSearch={handleSearch} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!session ? (
          <Auth />
        ) : showSellForm ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Sell an Item</h2>
                <button
                  onClick={() => setShowSellForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <SellItemForm onSuccess={() => {
                setShowSellForm(false);
                fetchItems();
              }} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {searchQuery ? 'Search Results' : 'Featured Items'}
              </h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="latest">Sort by: Latest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading items...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  {searchQuery 
                    ? 'No items found matching your search. Try different keywords.'
                    : 'No items found. Be the first to sell something!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}