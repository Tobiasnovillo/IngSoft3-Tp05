import { getDb } from '../db.js';

describe('Service: products', () => {
    test('AAA: inserta y lista', async () => {
        process.env.DB_PATH = ':memory:'; // DB aislada en RAM
        const db = await getDb();
        await db.run('DELETE FROM products');
        await db.run('INSERT INTO products (name, price) VALUES (?, ?)', ['Mouse', 9.99]);

        const rows = await db.all('SELECT * FROM products ORDER BY id');
        expect(rows).toHaveLength(1);
        expect(rows[0].name).toBe('Mouse');
        expect(rows[0].price).toBe(9.99);
    });
});
