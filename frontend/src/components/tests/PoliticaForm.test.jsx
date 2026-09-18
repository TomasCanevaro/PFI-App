import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PoliticaForm from '../PoliticaForm';

const problemas = [{ problema_id: 1, municipio_id: 1, problema: 'Falta de salud', categoria_problema: 'Salud', nivel_severidad: 8, poblacion_afectada: 1000 }];

describe('PoliticaForm', () => {
  it('shows municipal data for the selected problem', () => {
    render(<PoliticaForm problemas={problemas} problemaId="1" setProblemaId={vi.fn()} handlePredict={vi.fn()} />);
    expect(screen.getByLabelText('Problema municipal:')).toBeInTheDocument();
    expect(screen.getByText('Municipio:')).toBeInTheDocument();
    expect(screen.getByText('Falta de salud')).toBeInTheDocument();
  });
  it('updates the selected problem', () => {
    const setProblemaId = vi.fn();
    render(<PoliticaForm problemas={problemas} problemaId="" setProblemaId={setProblemaId} handlePredict={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Problema municipal:'), { target: { value: '1' } });
    expect(setProblemaId).toHaveBeenCalledWith('1');
  });
});
