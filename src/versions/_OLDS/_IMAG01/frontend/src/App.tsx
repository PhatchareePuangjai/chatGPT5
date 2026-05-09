import { useState, useEffect } from 'react';
import axios from 'axios';

// --- Types ---
interface Product {
  sku: string;
  name: string;
  stock: number;
  low_stock_threshold: number;
}

interface InventoryLog {
  id: number;
  sku: string;
  type: string;
  quantity_change: number;
  timestamp: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [buyQuantity, setBuyQuantity] = useState<{ [sku: string]: number }>({});
  const [cancelQuantity, setCancelQuantity] = useState<{ [sku: string]: number }>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/logs`);
      setLogs(res.data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchLogs();
  }, []);

  const handleBuy = async (sku: string) => {
    setErrorMsg(null);
    const qty = buyQuantity[sku] || 1;
    try {
      const res = await axios.post(`${API_URL}/api/buy`, { sku, quantity: qty });
      if (res.data.alert_triggered) {
        setAlerts(prev => [`Low stock alert for ${sku}! Remaining: ${res.data.remaining_stock}`, ...prev]);
      }
      fetchProducts();
      fetchLogs();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message);
    }
  };

  const handleCancel = async (sku: string) => {
    setErrorMsg(null);
    const qty = cancelQuantity[sku] || 1;
    try {
      await axios.post(`${API_URL}/api/cancel`, { sku, quantity: qty });
      fetchProducts();
      fetchLogs();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message);
    }
  };

  // Render
  return (
    <div className="min-h-screen p-8 md:p-12 lg:p-24 flex flex-col gap-12 max-w-7xl mx-auto">
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Inventory OS
        </h1>
        <p className="text-slate-400 text-lg">Real-time stock management & concurrency testing</p>
      </header>
      
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl flex items-center justify-between shadow-lg shadow-red-500/5">
          <span className="font-semibold">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-white bg-red-500/20 hover:bg-red-500/40 p-2 rounded-lg transition-colors">Dismiss</button>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-amber-400 font-semibold text-lg flex items-center gap-2">
             System Alerts
          </h2>
          <div className="flex flex-col gap-2">
            {alerts.slice(0, 3).map((a, i) => (
              <div key={i} className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-lg text-sm shadow-sm">
                {a}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="glass-panel p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-100 border-b border-slate-700 pb-4">Products</h2>
            <div className="grid gap-6">
              {products.map(p => (
                <div key={p.sku} className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex flex-col gap-2 w-full sm:w-1/3">
                    <span className="text-indigo-400 font-mono text-sm font-semibold">{p.sku}</span>
                    <span className="text-xl font-bold">{p.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock <= p.low_stock_threshold ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                        {p.stock} in stock
                      </span>
                      <span className="text-slate-500 text-xs">(Threshold: {p.low_stock_threshold})</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full sm:w-2/3 items-end">
                    <div className="flex gap-2 items-center w-full justify-end">
                      <input 
                        type="number" 
                        min="1" 
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 w-20 text-center text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        value={buyQuantity[p.sku] || 1}
                        onChange={e => setBuyQuantity({...buyQuantity, [p.sku]: parseInt(e.target.value)})}
                      />
                      <button 
                        onClick={() => handleBuy(p.sku)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md hover:shadow-indigo-500/25 active:scale-95"
                      >
                        Buy
                      </button>
                    </div>

                    <div className="flex gap-2 items-center w-full justify-end">
                      <input 
                        type="number" 
                        min="1" 
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 w-20 text-center text-sm focus:outline-none focus:border-purple-500 transition-colors"
                        value={cancelQuantity[p.sku] || 1}
                        onChange={e => setCancelQuantity({...cancelQuantity, [p.sku]: parseInt(e.target.value)})}
                      />
                      <button 
                        onClick={() => handleCancel(p.sku)}
                        className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg transition-all active:scale-95 border border-slate-600"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="glass-panel p-6 flex flex-col h-[600px]">
          <h2 className="text-xl font-bold mb-4 text-slate-100 border-b border-slate-700 pb-4 sticky top-0 bg-slate-800/50 backdrop-blur-md pt-2">Transaction Logs</h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {logs.map(log => (
              <div key={log.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono text-slate-400">{log.sku}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${log.type === 'SALE' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {log.type}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className={`text-lg font-bold ${log.quantity_change < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
