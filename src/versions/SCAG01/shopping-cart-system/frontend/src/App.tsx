import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart } from 'lucide-react';
import { formatCurrency } from './utils/currency';

interface Product {
  id: number;
  sku: string;
  name: string;
  priceCents: number;
  stock: number;
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  status: string;
  product: Product;
  lineTotal: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeItems, setActiveItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [errorConfig, setErrorConfig] = useState<{message: string} | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await axios.get('/api/cart');
      setActiveItems(res.data.activeItems);
      setSavedItems(res.data.savedItems);
      setGrandTotal(res.data.grandTotal);
    } catch (e) {
      console.error(e);
    }
  };

  const seedDb = async () => {
    await axios.post('/api/seed');
    fetchProducts();
    fetchCart();
  };

  const addToCart = async (productId: number, quantity: number) => {
    try {
      await axios.post('/api/cart/add', { productId, quantity });
      fetchCart();
      setErrorConfig(null);
    } catch (error: any) {
      if (error.response?.data?.error) {
        setErrorConfig({ message: error.response.data.error });
      } else {
        setErrorConfig({ message: 'Failed to add item' });
      }
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      await axios.put(`/api/cart/${itemId}/quantity`, { quantity });
      fetchCart();
      setErrorConfig(null);
    } catch (error: any) {
      if (error.response?.data?.error) {
        setErrorConfig({ message: error.response.data.error });
      } else {
        setErrorConfig({ message: 'Failed to update item' });
      }
    }
  };

  const saveForLater = async (itemId: number) => {
    try {
      await axios.put(`/api/cart/${itemId}/save`);
      fetchCart();
    } catch (error: any) {
       console.error(error);
    }
  };

  const moveToCart = async (itemId: number) => {
    try {
      await axios.put(`/api/cart/${itemId}/move-to-cart`);
      fetchCart();
      setErrorConfig(null);
    } catch (error: any) {
      if (error.response?.data?.error) {
        setErrorConfig({ message: error.response.data.error });
      }
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await axios.delete(`/api/cart/${itemId}/remove`);
      fetchCart();
    } catch (error: any) {
       console.error(error);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8 border-b pb-4">
         <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-blue-600"/>
            Shopping Cart System
         </h1>
         <button onClick={seedDb} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded font-medium text-sm transition">
           Reset & Seed Data
         </button>
      </header>

      {errorConfig && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 relative">
          <p className="font-bold">Alert</p>
          <p>{errorConfig.message}</p>
          <button onClick={() => setErrorConfig(null)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Available Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="font-mono text-sm text-gray-500 mb-1">{p.sku}</div>
                <h3 className="font-bold text-lg mb-2">{p.name}</h3>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-black text-blue-600">{formatCurrency(p.priceCents)} ฿</span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">Stock: {p.stock}</span>
                </div>
                <button 
                  onClick={() => addToCart(p.id, 1)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          {/* Saved Items */}
          {savedItems.length > 0 && (
             <div className="mt-12">
               <h2 className="text-xl font-bold mb-4 text-gray-700">Saved for Later</h2>
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 {savedItems.map(item => (
                   <div key={item.id} className="p-4 border-b last:border-0 flex justify-between items-center bg-gray-50">
                     <div>
                       <div className="font-bold">{item.product.name}</div>
                       <div className="text-sm text-gray-500">Qty saved: {item.quantity} &middot; {formatCurrency(item.product.priceCents)} ฿ / ea</div>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => moveToCart(item.id)} className="text-sm bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded transition shadow-sm font-medium text-gray-700">
                          Move to Cart
                        </button>
                        <button onClick={() => removeItem(item.id)} className="text-sm text-red-500 hover:text-red-700 font-medium px-2">
                          Remove
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>

        {/* Cart */}
        <div>
          <h2 className="text-xl font-bold mb-4">Your Cart</h2>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-8">
            <div className="p-6">
              {activeItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {activeItems.map(item => (
                    <div key={item.id} className="flex flex-col gap-3 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                       <div className="flex justify-between items-start">
                         <div>
                            <div className="font-bold">{item.product.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{formatCurrency(item.product.priceCents)} ฿ each</div>
                         </div>
                         <div className="font-bold text-lg">
                           {formatCurrency(item.lineTotal)} ฿
                         </div>
                       </div>
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm font-bold text-gray-600 hover:text-blue-600"
                            >-</button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm font-bold text-gray-600 hover:text-blue-600"
                            >+</button>
                          </div>
                          <div className="flex gap-3 text-sm">
                             <button onClick={() => saveForLater(item.id)} className="text-blue-600 hover:underline">Save for later</button>
                             <button onClick={() => removeItem(item.id)} className="text-red-500 hover:underline">Remove</button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-6 border-t border-gray-200">
               <div className="flex justify-between items-center mb-6">
                 <span className="text-gray-600 font-medium">Grand Total</span>
                 <span className="text-2xl font-black text-gray-900">{formatCurrency(grandTotal)} ฿</span>
               </div>
               <button 
                disabled={activeItems.length === 0}
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
                 Checkout
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
