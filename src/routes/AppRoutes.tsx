// src/routes/AppRoutes.tsx

import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import { Home } from '../components/Home';
import { Cart } from '../components/Cart';
import { Checkout } from '../components/Checkout';
import { Auth } from '../components/Auth';
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
  const navigate = useNavigate(); // Agregar useNavigate aquí

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

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </main>
  );
}