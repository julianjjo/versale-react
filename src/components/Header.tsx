import React, { useState, useEffect, useRef } from 'react';
import { Search, PlusCircle, User, LogOut, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  onSellClick: () => void;
  onSearch: (query: string) => void;
}

export function Header({ onSellClick, onSearch }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setShowMenu(false);
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigateToFavorites = () => {
    // TODO: Implement favorites page navigation
    setShowMenu(false);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-indigo-600">Versale</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for items..."
                onChange={handleSearch}
                className="w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onSellClick}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Sell Item</span>
            </button>
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <User className="h-6 w-6 text-gray-600" />
              </button>
              
              {showMenu && userEmail && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <div className="font-medium">Account</div>
                    <div className="text-gray-500 truncate">{userEmail}</div>
                  </div>
                  <button
                    onClick={navigateToFavorites}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Favorites</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}