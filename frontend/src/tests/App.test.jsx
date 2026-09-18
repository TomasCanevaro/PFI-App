
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mock local storage
let store = {};
const localStorageMock = (() => {
    return {
        getItem(key) {
            return store[key] || null;
        },
        setItem(key, value) {
            store[key] = value.toString();
        },
        removeItem(key) {
            delete store[key];
        },
        clear() {
            store = {};
        }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('App', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('renders Login page when not authenticated', async () => {
        render(
            <App RouterComponent={MemoryRouter} initialEntries={['/']} />
        );
        await waitFor(() => {
            expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
        });
    });

    it('renders MainApp when authenticated', async () => {
        window.localStorage.setItem('username', 'testuser');
        // MainApp solicita el historial y luego el catálogo municipal.
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ problemas: [] }) });
        
        render(
            <App RouterComponent={MemoryRouter} initialEntries={['/']} />
        );
        await waitFor(() => {
            expect(screen.getByText('Recomendar Política Pública')).toBeInTheDocument();
        });
    });

    it('renders Register page', () => {
        render(
            <App RouterComponent={MemoryRouter} initialEntries={['/register']} />
        );
        expect(screen.getByText('Registro')).toBeInTheDocument();
    });

    it('handles login and logout', async () => {
        // Clear localStorage before test
        window.localStorage.clear();
        
        // Login, historial y catálogo tras navegar a la pantalla principal.
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ token: 'testtoken', username: 'testuser' }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ problemas: [] }),
            });
        
        render(
            <App RouterComponent={MemoryRouter} initialEntries={['/login']} />
        );

        // Login
        fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password' } });
        fireEvent.click(screen.getByText('Entrar'));

        await waitFor(() => {
            expect(screen.getByText('Recomendar Política Pública')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Logout - should navigate back to login via Navigate component
        fireEvent.click(screen.getByText('Logout'));

        // Wait for navigation and re-render
        await waitFor(() => {
            expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
