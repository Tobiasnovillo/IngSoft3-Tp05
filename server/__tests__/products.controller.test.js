import request from 'supertest';
import { app } from '../app.js';
import { getDb } from '../db.js';

beforeAll(async () => {
    process.env.DB_PATH = ':memory:'; // no toca archivos
    const db = await getDb();
    await db.run('DELETE FROM products');
    await db.run('INSERT INTO products (name, price) VALUES (?, ?), (?, ?)', ['Keyboard', 29.5, 'Headset', 49.9]);
});

describe('Controller: /api/products', () => {
    test('GET devuelve array', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    test('POST valida payload y crea', async () => {
        const bad = await request(app).post('/api/products').send({ name: 'Bad' });
        expect(bad.statusCode).toBe(400);

        const ok = await request(app).post('/api/products').send({ name: 'Webcam', price: 99.99 });
        expect(ok.statusCode).toBe(201);
        expect(ok.body.id).toBeDefined();
    });
});
