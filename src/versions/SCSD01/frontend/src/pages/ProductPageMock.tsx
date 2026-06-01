import React, { useState } from 'react';
import { addToCart } from '../services/cartApi';
import { InlineError } from '../components/InlineError';

export function ProductPageMock(): JSX.Element {
  const [error, setError] = useState('');

  async function addSku001(): Promise<void> {
    setError('');
    try {
      await addToCart('SKU-001', 2, 10000);
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Product Mock</h1>
      <button type="button" onClick={addSku001}>
        Add SKU-001 (qty 2)
      </button>
      {error ? <InlineError message={error} /> : null}
    </div>
  );
}

