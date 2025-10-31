
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../Register';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock fetch
global.fetch = vi.fn();

describe('Register', () => {
  it('renders correctly', () => {
    render(
        <BrowserRouter>
            <Register />
        </BrowserRouter>
    );

    expect(screen.getByText('Registro')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByText('Registrar')).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(
        <BrowserRouter>
            <Register />
        </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText('Usuario');
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(usernameInput.value).toBe('testuser');

    const passwordInput = screen.getByPlaceholderText('Contraseña');
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    expect(passwordInput.value).toBe('password');
  });

  it('displays success message on successful registration', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Usuario registrado con éxito' }),
    });

    render(
        <BrowserRouter>
            <Register />
        </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'newpassword' } });
    fireEvent.click(screen.getByText('Registrar'));

    await waitFor(() => {
      expect(screen.getByText('Usuario registrado con éxito')).toBeInTheDocument();
    });
  });

  it('displays error message on failed registration', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'User already exists' }),
    });

    render(
        <BrowserRouter>
            <Register />
        </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'existinguser' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Registrar'));

    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });
});
