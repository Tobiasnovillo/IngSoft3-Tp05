// Ajustá la ruta si tu api vive en otro lugar
import { getProducts } from '../src/api.js';
import { jest } from '@jest/globals';


global.fetch = jest.fn();

beforeEach(() => jest.clearAllMocks());

test('getProducts devuelve array', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, name: 'Mouse' }] });
    const data = await getProducts();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].name).toBe('Mouse');
});

test('getProducts lanza si la red falla', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(getProducts()).rejects.toThrow('Network error');
});
