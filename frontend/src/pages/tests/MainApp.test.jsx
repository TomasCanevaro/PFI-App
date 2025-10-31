
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MainApp from '../MainApp';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock fetch
global.fetch = vi.fn();

// Mock window.confirm
global.window.confirm = vi.fn(() => true);

describe('MainApp', () => {
  beforeEach(() => {
    // Reset mocks before each test
    fetch.mockClear();
    window.confirm.mockClear();
    // Mock local storage
    Storage.prototype.getItem = vi.fn(() => 'test-token');
  });

  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    );

    expect(screen.getByText('Evaluar Política Pública')).toBeInTheDocument();
  });

  it('fetches and displays history on mount', async () => {
    const mockHistory = [
      { _id: '1', objetivo: 'Test 1', grupo: 'Grupo 1', prediccion: 'Éxito', probabilidad_exito: 80, resultado_real: 'Éxito', fecha: '2023-01-01' },
    ];
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockHistory });

    render(
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Parties historial is hidden by default, need to click "Mostrar"
      fireEvent.click(screen.getByText('Mostrar'));
    });

    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });
  });

  it('handles prediction and suggestion fetching', async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // initial history fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ prediccion: 'Éxito', probabilidad_exito: 80 }) }) // predict
      .mockResolvedValueOnce({ ok: true, json: async () => ({ "Objetivo principal": "Sugerencia 1", Grupo: "Seguridad / TIC", Probabilidad_exito: 75 }) }); // suggest

    render(
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText('Objetivo principal:'), { target: { value: 'Test Objetivo' } });
    fireEvent.change(screen.getByLabelText('Grupo:'), { target: { value: 'Seguridad / TIC' } });
    fireEvent.click(screen.getByText('Evaluar'));

    await waitFor(() => {
      expect(screen.getByText('Resultado')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Sugerencia de política')).toBeInTheDocument();
    });
  });

  it('handles saving a result', async () => {
    // Initial history, predict, suggest, save, and final history fetch
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ prediccion: 'Éxito', probabilidad_exito: 80 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ "Objetivo principal": "Sugerencia 1", Grupo: "Seguridad / TIC", Probabilidad_exito: 75 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    render(
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    );

    // Fill form and predict
    fireEvent.change(screen.getByLabelText('Objetivo principal:'), { target: { value: 'Test Objetivo' } });
    fireEvent.change(screen.getByLabelText('Grupo:'), { target: { value: 'Seguridad / TIC' } });
    fireEvent.click(screen.getByText('Evaluar'));

    // Wait for the result to appear
    await waitFor(() => {
        expect(screen.getByText('Resultado')).toBeInTheDocument();
    });

    // Save the result
    fireEvent.click(screen.getByText('Marcar como Éxito'));

    await waitFor(() => {
      // The save call is the 4th fetch call in this test
      expect(fetch.mock.calls.length).toBe(5);
      expect(fetch.mock.calls[3][0]).toBe('http://127.0.0.1:5000/save');
    });
  });

  it('handles deleting a history record', async () => {
    const mockHistory = [
      { _id: '1', objetivo: 'Test 1', grupo: 'Grupo 1', prediccion: 'Éxito', probabilidad_exito: 80, resultado_real: 'Éxito', fecha: '2023-01-01' },
    ];
    // Initial history, delete, and final history fetch
    fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockHistory })
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

    render(
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    );

    // Historial is hidden by default, need to click "Mostrar"
    await waitFor(() => {
      fireEvent.click(screen.getByText('Mostrar'));
    });

    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Eliminar'));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(fetch.mock.calls.length).toBe(3);
      expect(fetch.mock.calls[1][0]).toBe('http://127.0.0.1:5000/history/1');
    });
  });
});
