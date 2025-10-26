import express from 'express';
import cors from 'cors';
import { getDb } from './db.js';

const app = express();
app.use(express.json());

const allowedOrigins = [
    'https://myshop1.azurewebsites.net',
    'https://myshop1prod.azurewebsites.net',
    'http://localhost:3000'
];

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error('Not allowed by CORS'));
    }
}));

// Health
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// API
app.get('/api/products', async (_req, res) => {
    const db = await getDb();
    const rows = await db.all('SELECT id, name, price FROM products ORDER BY id');
    res.json(rows);
});

app.post('/api/products', async (req, res) => {
    const { name, price } = req.body ?? {};
    if (!name || typeof price !== 'number') {
        return res.status(400).json({ error: 'Invalid payload' });
    }
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO products (name, price) VALUES (?, ?)',
        [name, price]
    );
    res.status(201).json({ id: result.lastID, name, price });
});

export { app };
