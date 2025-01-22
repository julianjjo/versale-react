// src/components/Cart.tsx
import React from 'react';
import { useCart } from '../context/CartContext';

interface CartComponentProps {
  onCheckout: () => void;
}

export function Cart({ onCheckout }: CartComponentProps): JSX.Element {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    fetchCart,
  } = useCart();

  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sección izquierda: listado de productos */}
      <div className="flex-1">
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500 text-lg mt-4">
            Tu carrito está vacío.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-100 p-4 rounded-lg shadow transition hover:shadow-lg"
              >
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="h-40 w-full object-cover rounded-md"
                />
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-gray-500 capitalize">{item.category}</p>
                  <p className="text-gray-900 font-bold mt-1">
                    ${item.price}
                  </p>

                  {/* Sección para manejar cantidad */}
                  <div className="mt-2 flex items-center space-x-2">
                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.id,
                          Math.max(1, (item.quantity || 1) - 1)
                        )
                      }
                      className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                      disabled={(item.quantity || 1) <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity || 1}</span>
                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.id,
                          (item.quantity || 1) + 1
                        )
                      }
                      className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="mt-2 w-full inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección derecha: resumen del carrito */}
      {cartItems.length > 0 && (
        <div className="lg:w-1/3 bg-white p-6 rounded-md shadow-md h-fit self-start sticky top-4">
          <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Artículos:</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={onCheckout} // <-- al hacer click, llamamos a la función del padre
            className="mt-6 w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
          >
            Comprar
          </button>
        </div>
      )}
    </div>
  );
}