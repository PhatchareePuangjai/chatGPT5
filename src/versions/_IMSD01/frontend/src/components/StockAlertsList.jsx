const StockAlertsList = ({ alerts }) => {
  if (!alerts?.length) {
    return <p className="muted">ยังไม่มีการแจ้งเตือนสต็อกต่ำ</p>;
  }

  return (
    <div className="card">
      <h4>แจ้งเตือนสต็อกต่ำ</h4>
      <ul>
        {alerts.map((alert) => (
          <li key={alert.id}>
            SKU {alert.sku}: คงเหลือ {alert.quantity} (เกณฑ์ {alert.threshold})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StockAlertsList;
