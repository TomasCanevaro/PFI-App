import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Historial from '../Historial';

const historial = [{ _id: '1', problema: 'Falta de salud', municipio_id: 1, politica_recomendada: 'Centro de salud', puntaje_recomendacion: 80, resultado_real: 'Implementada', fecha: '2026-09-17' }];
describe('Historial', () => {
  it('shows saved recommendations', () => { render(<Historial historial={historial} onDelete={vi.fn()} />); fireEvent.click(screen.getByText('Mostrar')); expect(screen.getByText('Centro de salud')).toBeInTheDocument(); });
  it('deletes the selected item', () => { const remove = vi.fn(); render(<Historial historial={historial} onDelete={remove} />); fireEvent.click(screen.getByText('Mostrar')); fireEvent.click(screen.getByText('Eliminar')); expect(remove).toHaveBeenCalledWith('1'); });
});
