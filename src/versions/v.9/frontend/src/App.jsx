import './App.css';
import InventoryPage from './pages/InventoryPage';

const App = () => (
  <main className="app">
    <header className="app-header">
      <div>
        <h1>ระบบจัดการสต็อกสินค้า</h1>
        <p className="muted">จัดการตัดสต็อก แจ้งเตือน และคืนสต็อกในหน้าเดียว</p>
      </div>
    </header>
    <InventoryPage />
  </main>
);

export default App;
