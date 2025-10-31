
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock fetch
global.fetch = vi.fn();

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('Login', () => {
  const onLogin = vi.fn();

  it('renders correctly', () => {
    render(
        <BrowserRouter>
            <Login onLogin={onLogin} />
        </BrowserRouter>
    );

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(
        <BrowserRouter>
            <Login onLogin={onLogin} />
        </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText('Usuario');
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(usernameInput.value).toBe('testuser');

    const passwordInput = screen.getByPlaceholderText('Contraseña');
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    expect(passwordInput.value).toBe('password');
  });

  it('calls onLogin and navigates on successful login', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'testtoken', username: 'testuser' }),
    });

    render(
        <BrowserRouter>
            <Login onLogin={onLogin} />
        </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith('testuser');
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays error message on failed login', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    render(
        <BrowserRouter>
            <Login onLogin={onLogin} />
        </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
