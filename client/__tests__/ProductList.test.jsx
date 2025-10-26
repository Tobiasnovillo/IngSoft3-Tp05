import { render, screen, waitFor } from '@testing-library/react';
import ProductList from '../src/components/ProductList.jsx';
import { jest } from '@jest/globals';


global.fetch = jest.fn();

test('renderiza productos desde la API', async () => {
    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, name: 'Keyboard', price: 50 }]
    });

    render(<ProductList />);

    await waitFor(() => {
        expect(screen.getByText(/Keyboard/)).toBeInTheDocument();
    });
});
