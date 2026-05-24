import React from 'react';
import ReactDOM from 'react-dom/client';
import { CartPage } from './pages/CartPage';
import { CartProvider } from './state/cartStore';
import { makeCartApi } from './services/cartApi';

const api = makeCartApi({ baseUrl: 'http://localhost:3001' });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CartProvider api={api}>
      <CartPage />
    </CartProvider>
  </React.StrictMode>,
);

