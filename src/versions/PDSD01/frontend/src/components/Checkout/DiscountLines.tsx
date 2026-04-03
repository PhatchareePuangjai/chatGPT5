type DiscountLineItem = {
  type: "coupon" | "promotion";
  sourceId: string;
  amount: number;
};

type Props = {
  items: DiscountLineItem[];
};

export default function DiscountLines({ items }: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <h3>Discounts</h3>
      <ul>
        {items.map((item) => (
          <li key={`${item.type}-${item.sourceId}`}>
            <span>{item.sourceId}</span>
            <span>-{item.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
