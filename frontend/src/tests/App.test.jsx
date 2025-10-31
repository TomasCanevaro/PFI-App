
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
        // Mock fetch for MainApp's history fetch
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([]),
            })
        );
        
        render(
            <App RouterComponent={MemoryRouter} initialEntries={['/']} />
        );
        await waitFor(() => {
            expect(screen.getByText('Evaluar Política Pública')).toBeInTheDocument();
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
        
        // Mock fetch - first for login, then for MainApp history fetch after navigation
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ token: 'testtoken', username: 'testuser' }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([]),
            });
        
        render(
            <App RouterComponent={MemoryRouter} initialEntries={['/login']} />
        );

        // Login
        fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password' } });
        fireEvent.click(screen.getByText('Entrar'));

        await waitFor(() => {
            expect(screen.getByText('Evaluar Política Pública')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Logout - should navigate back to login via Navigate component
        fireEvent.click(screen.getByText('Logout'));

        // Wait for navigation and re-render
        await waitFor(() => {
            expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
