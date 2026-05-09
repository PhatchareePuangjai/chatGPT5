const { performance } = require('perf_hooks');

const baseUrl = process.env.BENCHMARK_BASE_URL || 'http://localhost:8080/api';
const sku = process.env.BENCHMARK_SKU || 'SKU-001';
const runs = Number(process.env.BENCHMARK_RUNS || 10);

const run = async () => {
  const start = performance.now();
  for (let i = 0; i < runs; i += 1) {
    const response = await fetch(`${baseUrl}/inventory/${sku}/deduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 1, order_id: `bench-${i}` }),
    });

    if (!response.ok) {
      const payload = await response.text();
      throw new Error(`Request failed: ${payload}`);
    }
  }
  const end = performance.now();
  const avgMs = (end - start) / runs;
  console.log(`Average deduct latency: ${avgMs.toFixed(2)}ms`);
};

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
