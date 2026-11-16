// QR Cake REST API with Node.js 18+ (built-in fetch, no dependencies).
// Needs an API key from your QR Cake dashboard:  QRCAKE_API_KEY=... node node.mjs
// Docs: https://qrcake.com/docs

const API = 'https://api.qrcake.com/v1/product/api';
const key = process.env.QRCAKE_API_KEY;
if (!key) throw new Error('Set QRCAKE_API_KEY to an API key from your QR Cake dashboard');

async function call(method, path, body) {
  const response = await fetch(API + path, {
    method,
    headers: { 'x-api-key': key, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${path} failed: ${response.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

console.log('What this key may do:', await call('GET', '/permission'));

const codes = await call('GET', '/product');
console.log(`You have ${codes.length} QR codes`);

// A dynamic QR code for a URL.
const created = await call('POST', '/product', {
  redirect: 'https://example.com/menu',
  metadata: { type: 'redirect' },
});
const id = created.productId;
console.log('Created', id);

// Point it somewhere new. The printed code stays the same.
await call('PUT', `/product/${id}`, { redirect: 'https://example.com/autumn-menu' });

// Pause it, then switch it back on.
await call('PUT', `/product/${id}`, { state: 'INACTIVE' });
await call('PUT', `/product/${id}`, { state: 'ACTIVE' });

// Delete it. This is permanent: printed copies stop working.
await call('DELETE', `/product/${id}`);
console.log('Deleted', id);
