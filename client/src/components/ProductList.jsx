import { useEffect, useState } from 'react';
import { getProducts } from '../api';
import { jest } from '@jest/globals';


export default function ProductList() {
    const [items, setItems] = useState([]);
    useEffect(() => {
        getProducts().then(setItems).catch(() => setItems([]));
    }, []);
    return (
        <div>
            <h2>Products</h2>
            <ul data-testid="product-list">
                {items.map(p => <li key={p.id}>{p.name} - ${p.price}</li>)}
            </ul>
        </div>
    );
}
