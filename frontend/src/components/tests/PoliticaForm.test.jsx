
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PoliticaForm from '../PoliticaForm';
import { describe, it, expect, vi } from 'vitest';

describe('PoliticaForm', () => {
  const handlePredict = vi.fn();
  const setObjetivo = vi.fn();
  const setGrupo = vi.fn();
  const gruposDisponibles = ['Grupo 1', 'Grupo 2', 'Grupo 3'];

  it('renders correctly', () => {
    render(
      <PoliticaForm
        objetivo=""
        setObjetivo={setObjetivo}
        grupo=""
        setGrupo={setGrupo}
        handlePredict={handlePredict}
        gruposDisponibles={gruposDisponibles}
      />
    );

    expect(screen.getByLabelText('Objetivo principal:')).toBeInTheDocument();
    expect(screen.getByLabelText('Grupo:')).toBeInTheDocument();
    expect(screen.getByText('Evaluar')).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(
      <PoliticaForm
        objetivo=""
        setObjetivo={setObjetivo}
        grupo=""
        setGrupo={setGrupo}
        handlePredict={handlePredict}
        gruposDisponibles={gruposDisponibles}
      />
    );

    const input = screen.getByLabelText('Objetivo principal:');
    fireEvent.change(input, { target: { value: 'Test' } });
    expect(setObjetivo).toHaveBeenCalledWith('Test');
  });

  it('updates select value on change', () => {
    render(
      <PoliticaForm
        objetivo=""
        setObjetivo={setObjetivo}
        grupo=""
        setGrupo={setGrupo}
        handlePredict={handlePredict}
        gruposDisponibles={gruposDisponibles}
      />
    );

    const select = screen.getByLabelText('Grupo:');
    fireEvent.change(select, { target: { value: 'Grupo 1' } });
    expect(setGrupo).toHaveBeenCalledWith('Grupo 1');
  });

  it('calls handlePredict on form submission', () => {
    const handlePredict = vi.fn((e) => e.preventDefault());
    render(
      <PoliticaForm
        objetivo="Test"
        setObjetivo={setObjetivo}
        grupo="Grupo 1"
        setGrupo={setGrupo}
        handlePredict={handlePredict}
        gruposDisponibles={gruposDisponibles}
      />
    );

    const form = screen.getByRole('button', { name: 'Evaluar' });
    fireEvent.submit(form);
    expect(handlePredict).toHaveBeenCalled();
  });
});
