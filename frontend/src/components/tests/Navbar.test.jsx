import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../Navbar';

describe('Navbar', () => {
  it('renders the navbar with the correct title', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    const titleElement = screen.getByText(/Políticas Públicas/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders login and register links when no user is provided', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('renders home link and logout button when a user is provided', () => {
    const user = { name: 'Test User' };
    render(
      <BrowserRouter>
        <Navbar user={user} />
      </BrowserRouter>
    );
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls onLogout when the logout button is clicked', () => {
    const user = { name: 'Test User' };
    const onLogout = vi.fn();
    render(
      <BrowserRouter>
        <Navbar user={user} onLogout={onLogout} />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByText('Logout'));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
