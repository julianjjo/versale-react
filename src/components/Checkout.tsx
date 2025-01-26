import React, { useState } from 'react';
import type { ClothingItem } from '../types';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';

interface CheckoutProps {
  items: ClothingItem[];
  onPurchaseComplete: () => void;
}

export function Checkout({ items, onPurchaseComplete }: CheckoutProps): JSX.Element {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const { clearCart } = useCart();

  // Calculamos el subtotal solo a manera de confirmación
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Begin a transaction
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Create purchase records for each item
      const purchasePromises = items.map(item =>
        supabase
          .from('purchases')
          .insert({
            user_id: user.id,
            item_id: item.id,
            quantity: item.quantity || 1
          })
          .single()
      );

      // Execute all purchase inserts (triggers will handle stock updates)
      const results = await Promise.all(purchasePromises);
      const errors = results.filter(r => r.error).map(r => r.error);
      
      if (errors.length > 0) {
        throw new Error(`Error al procesar la compra: ${errors[0]?.message}`);
      }

      // Clear cart after successful stock update
      await clearCart();

      // Formateamos la lista de artículos
      const itemsText = items
        .map(
          (i) =>
            `- ${i.title} (x${i.quantity || 1}) => $${(i.price * (i.quantity || 1)).toFixed(2)}`
        )
        .join('%0A');

      const message = `¡Hola! Quiero realizar un pedido:%0A%0A${itemsText}%0A%0ASubtotal: $${subtotal.toFixed(
        2
      )}%0A%0ADetalles de envío:%0ANombre: ${encodeURIComponent(name)}%0ADirección: ${encodeURIComponent(address)}%0ATeléfono: ${encodeURIComponent(phone)}`;

      const whatsappNumber = '573003979242';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');

      onPurchaseComplete();
    } catch (error) {
      console.error('Error en el proceso de compra:', error);
      alert('Hubo un error al procesar la compra. Por favor, intenta de nuevo.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 pt-20 sm:pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No hay artículos para comprar</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 pt-20 sm:pt-16">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Comprar</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-4">
                Subtotal: <span className="text-gray-700">${subtotal.toFixed(2)}</span>
              </h3>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
              >
                Confirmar y Enviar a WhatsApp
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}