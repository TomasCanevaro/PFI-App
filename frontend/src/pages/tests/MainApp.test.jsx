import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MainApp from '../MainApp';

global.fetch = vi.fn();
const problema = { problema_id: 1, municipio_id: 1, problema: 'Falta de salud', categoria_problema: 'Salud', nivel_severidad: 8, poblacion_afectada: 1000 };
const recomendacion = { problema: 'Falta de salud', municipio_id: 1, politica_recomendada: 'Centro de salud', categoria_politica: 'Salud', puntaje_recomendacion: 80, costo_estimado: 1000, tiempo_implementacion_meses: 4, dificultad_implementacion: 30, alternativas: [] };
describe('MainApp', () => {
  beforeEach(() => { fetch.mockReset(); Storage.prototype.getItem = vi.fn(() => 'token'); });
  it('requests and displays a recommendation', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }).mockResolvedValueOnce({ ok: true, json: async () => ({ problemas: [problema] }) }).mockResolvedValueOnce({ ok: true, json: async () => recomendacion });
    render(<BrowserRouter><MainApp /></BrowserRouter>);
    await waitFor(() => expect(screen.getByLabelText('Problema municipal:')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Problema municipal:'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Recomendar política'));
    await waitFor(() => expect(screen.getByText('Centro de salud')).toBeInTheDocument());
  });
});
