// src/App.tsx

import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { SellItemForm } from './components/SellItemForm';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  // Manejo de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  // Manejo de modal de venta
  const [showSellForm, setShowSellForm] = useState(false);

  const handleSellClick = () => {
    setShowSellForm(true);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          {/* 
            Pasamos onSearch y onSellClick al Header
          */}
          <Header
            onSearch={(q) => setSearchQuery(q)}
            onSellClick={handleSellClick}
          />
          <AppRoutes searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          
          {showSellForm && (
            <SellItemForm
              onClose={() => setShowSellForm(false)}
              onSuccess={() => setShowSellForm(false)}
            />
          )}
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;