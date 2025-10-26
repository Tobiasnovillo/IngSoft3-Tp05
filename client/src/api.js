import { jest } from '@jest/globals';

export async function getProducts() {
    const base = import.meta?.env?.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || '';
    const res = await fetch(`${base}/api/products`);
    if (!res.ok) throw new Error('Network error');
    return res.json();
}
