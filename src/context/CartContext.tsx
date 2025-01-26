// src/context/CartContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { ClothingItem } from '../types';

interface CartContextValue {
  cartItems: ClothingItem[];
  addToCart: (item: ClothingItem) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartQuantity: (itemId: string, newQuantity: number) => Promise<void>;
  fetchCart: () => Promise<void>;
  clearCart: () => Promise<void>; // <-- Nueva función
}

const CartContext = createContext<CartContextValue>({
  cartItems: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateCartQuantity: async () => {},
  fetchCart: async () => {},
  clearCart: async () => {}, // <-- Inicialización
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const [cartItems, setCartItems] = useState<ClothingItem[]>([]);

  // Función para obtener el carrito de la BD
  const fetchCart = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          item:items(*)
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching cart items:', error);
        return;
      }

      if (data) {
        const mapped = data.map((row: any) => ({
          ...row.item,
          quantity: row.quantity,
        })) as ClothingItem[];
        setCartItems(mapped);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cargar carrito en cada cambio de userId
  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // addToCart
  const addToCart = async (item: ClothingItem) => {
    if (!userId) return;
    try {
      // Get current stock
      const { data: stockData, error: stockError } = await supabase
        .from('items')
        .select('stock')
        .eq('id', item.id)
        .single();
      
      if (stockError) throw stockError;
      if (!stockData || stockData.stock <= 0) {
        throw new Error('No hay stock disponible');
      }

      const existing = cartItems.find((ci) => ci.id === item.id);
      if (existing) {
        if ((existing.quantity || 1) >= stockData.stock) {
          throw new Error('Stock insuficiente');
        }
        await updateCartQuantity(item.id, (existing.quantity || 1) + 1);
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            item_id: item.id,
            quantity: 1,
          });
        if (error) throw error;
        setCartItems((curr) => [...curr, { ...item, quantity: 1 }]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // removeFromCart
  const removeFromCart = async (itemId: string) => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('item_id', itemId)
        .eq('user_id', userId);
      if (error) throw error;
      setCartItems((curr) => curr.filter((c) => c.id !== itemId));
    } catch (err) {
      console.error(err);
    }
  };

  // updateCartQuantity
  const updateCartQuantity = async (itemId: string, newQuantity: number) => {
    if (!userId) return;
    try {
      // Check stock availability
      const { data: stockData, error: stockError } = await supabase
        .from('items')
        .select('stock')
        .eq('id', itemId)
        .single();
      
      if (stockError) throw stockError;
      if (!stockData) throw new Error('Producto no encontrado');
      
      if (newQuantity > stockData.stock) {
        throw new Error(`Solo hay ${stockData.stock} unidades disponibles`);
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('item_id', itemId)
        .eq('user_id', userId);

      if (error) throw error;

      setCartItems((curr) =>
        curr.map((ci) =>
          ci.id === itemId ? { ...ci, quantity: newQuantity } : ci
        )
      );
    } catch (err) {
      console.error(err);
      throw err; // Re-throw para manejar el error en el componente
    }
  };

  // clearCart
  const clearCart = async () => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);
      if (error) throw error;
      setCartItems([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        fetchCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}