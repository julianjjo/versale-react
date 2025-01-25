// src/routes/AppRoutes.tsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ClothingItem } from '../types';

import { Home } from '../components/Home';
import { Cart } from '../components/Cart';
import { Checkout } from '../components/Checkout';
import { Auth } from '../components/Auth';
import { ProductView } from '../components/ProductView';
import { AdminDashboard } from '../components/AdminDashboard';
import { Favorites } from '../components/Favorites';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface AppRoutesProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export function AppRoutes({ searchQuery, setSearchQuery }: AppRoutesProps) {
  const { isAdmin, isLoggedIn } = useAuth();
  const { cartItems, addToCart, removeFromCart, updateCartQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<ClothingItem | null>(null);

  useEffect(() => {
    const fetchProduct = async (productId: string) => {
      try {
        const { data: product, error } = await supabase
          .from('items')
          .select('*, category(*)')
          .eq('id', productId)
          .single();

        if (error) {
          console.error('Error fetching product:', error);
          return;
        }

        setSelectedProduct(product);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    // Get product ID from URL if on product page
    const path = window.location.pathname;
    const match = path.match(/^\/product\/(.+)$/);
    if (match) {
      fetchProduct(match[1]);
    }
  }, [window.location.pathname]);

  const handlePurchaseComplete = async () => {
    await clearCart();
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Routes>
        <Route
          path="/"
          element={
            <Home
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isAdmin={isAdmin}
              addToCart={addToCart}
            />
          }
        />
        <Route
          path="/cart"
          element={
            <Cart onCheckout={() => navigate('/checkout')} /> // Usar navigate en lugar de window.location.href
          }
        />
        <Route
          path="/checkout"
          element={
            isLoggedIn ? (
              <Checkout
                items={cartItems}
                onPurchaseComplete={handlePurchaseComplete}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={<Auth />}
        />
        <Route
          path="/admin"
          element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/favorites"
          element={
            isLoggedIn ? (
              <Favorites />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/product/:id"
          element={
            selectedProduct ? (
              <ProductView item={selectedProduct} addToCart={addToCart} />
            ) : (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            )
          }
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </main>
  );
}