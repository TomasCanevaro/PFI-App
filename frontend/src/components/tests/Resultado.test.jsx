import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Resultado from '../Resultado';

const resultado = { politica_recomendada: 'Centro de salud', categoria_politica: 'Salud', puntaje_recomendacion: 80, costo_estimado: 1000, tiempo_implementacion_meses: 4, dificultad_implementacion: 30, alternativas: [{ politica: 'Centro de salud', puntaje_recomendacion: 80 }, { politica: 'Taller', puntaje_recomendacion: 20 }] };
describe('Resultado', () => {
  it('renders recommendation and alternatives', () => { render(<Resultado resultado={resultado} guardarResultado={vi.fn()} />); expect(screen.getByText('Centro de salud')).toBeInTheDocument(); expect(screen.getByText('Taller (20%)')).toBeInTheDocument(); });
  it('saves implementation status', () => { const save = vi.fn(); render(<Resultado resultado={resultado} guardarResultado={save} />); fireEvent.click(screen.getByText('Marcar como implementada')); expect(save).toHaveBeenCalledWith('Implementada'); });
});
