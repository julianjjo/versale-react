// src/components/Checkout.tsx

import React, { useState } from 'react';
import type { ClothingItem } from '../types';

interface CheckoutProps {
  items: ClothingItem[];
  onPurchaseComplete: () => void;
}

export function Checkout({ items, onPurchaseComplete }: CheckoutProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Calculamos el subtotal solo a manera de confirmación
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Formateamos la lista de artículos
    const itemsText = items
      .map(
        (i) =>
          `- ${i.title} (x${i.quantity || 1}) => $${(i.price * (i.quantity || 1)).toFixed(2)}`
      )
      .join('%0A'); // %0A = salto de línea en la URL

    const message = `¡Hola! Quiero realizar un pedido:%0A%0A${itemsText}%0A%0ASubtotal: $${subtotal.toFixed(
      2
    )}%0A%0ADetalles de envío:%0ANombre: ${encodeURIComponent(name)}%0ADirección: ${encodeURIComponent(address)}%0ATeléfono: ${encodeURIComponent(phone)}`;

    // Get WhatsApp number from env and remove the + if present
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER.replace('+', '');

    // Abrimos la ventana de WhatsApp con el mensaje
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    onPurchaseComplete();
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