// src/components/Header.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  User,
  LogOut,
  Heart,
  Settings,
  ShoppingCart,
  Menu,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onSellClick?: () => void;
  onSearch: (query: string) => void;
}

export function Header({ onSellClick, onSearch }: HeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUserEmail(data.user.email ?? null);
      } else if (error) {
        if (error.message.includes('Auth session missing')) {
          setUserEmail(null);
        } else {
          console.error('Error al obtener el usuario:', error);
        }
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideMobileMenu = mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node);
        
      const isOutsideUserMenu = menuRef.current &&
        !menuRef.current.contains(event.target as Node);

      if (showMobileMenu && isOutsideMobileMenu) {
        setShowMobileMenu(false);
      }
      if (showUserMenu && isOutsideUserMenu) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu, showUserMenu]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setShowMobileMenu(false);
      setShowUserMenu(false);
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-xl sm:text-2xl font-bold text-indigo-600">
                ReNova2
              </Link>
              <div className="hidden sm:block relative">
                <input
                  type="text"
                  placeholder="Buscar artículos..."
                  onChange={handleSearch}
                  className="w-64 sm:w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="sm:hidden">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  aria-label="Menu"
                >
                  {showMobileMenu ? (
                    <X className="h-6 w-6 text-gray-600" />
                  ) : (
                    <Menu className="h-6 w-6 text-gray-600" />
                  )}
                </button>
              </div>

              <div className="hidden sm:flex items-center space-x-4">
                {onSellClick && isAdmin && (
                  <button
                    onClick={onSellClick}
                    className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span className="hidden sm:inline">Vender Artículo</span>
                  </button>
                )}

                {!isAdmin && (
                  <Link
                    to="/cart"
                    className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="hidden sm:inline">Carrito</span>
                  </Link>
                )}
              </div>

              <div className="hidden sm:block">
                {userEmail ? (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="p-2 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <User className="h-6 w-6 text-gray-600" />
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-60">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                          <div className="font-medium">Cuenta</div>
                          <div className="text-gray-500 truncate">{userEmail}</div>
                        </div>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Panel de Administración</span>
                          </Link>
                        )}
                        <Link
                          to="/favorites"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Heart className="h-4 w-4" />
                          <span>Favoritos</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-900">
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu with fixed positioning and scroll */}
      {showMobileMenu && (
        <>
          <div
            className="fixed inset-0 bg-black opacity-25 z-40"
            onClick={() => setShowMobileMenu(false)}
          />
          <nav ref={mobileMenuRef} className="fixed top-16 left-0 right-0 bottom-0 z-50 bg-white shadow-md sm:hidden overflow-y-auto">
            <div className="px-4 pt-4 pb-6 space-y-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar artículos..."
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>

              {onSellClick && isAdmin && (
                <button
                  onClick={() => {
                    onSellClick();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Vender Artículo</span>
                </button>
              )}

              {!isAdmin && (
                <Link
                  to="/cart"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-900"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Carrito</span>
                </Link>
              )}

              {userEmail ? (
                <div className="border-t border-gray-200 pt-2">
                  <div className="px-4 py-2 text-sm text-gray-700">
                    <div className="font-medium">Cuenta</div>
                    <div className="text-gray-500 truncate">{userEmail}</div>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Panel de Administración</span>
                    </Link>
                  )}

                  <Link
                    to="/favorites"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Heart className="h-4 w-4" />
                    <span>Favoritos</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-900"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Iniciar Sesión</span>
                </Link>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  );
}