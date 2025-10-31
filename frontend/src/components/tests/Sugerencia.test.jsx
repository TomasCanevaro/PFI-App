
import React from 'react';
import { render, screen } from '@testing-library/react';
import Sugerencia from '../Sugerencia';
import { describe, it, expect } from 'vitest';

describe('Sugerencia', () => {
  const sugerencia = {
    "Objetivo principal": "Test Objetivo",
    "Grupo": "Test Grupo",
    "Probabilidad_exito": 90,
    "Evaluacion": "Test Evaluacion",
  };

  it('renders correctly with suggestion', () => {
    render(<Sugerencia sugerencia={sugerencia} />);

    expect(screen.getByText('Sugerencia de política')).toBeInTheDocument();
    expect(screen.getByText('Objetivo:')).toBeInTheDocument();
    expect(screen.getByText('Test Objetivo')).toBeInTheDocument();
    expect(screen.getByText('Grupo:')).toBeInTheDocument();
    expect(screen.getByText('Test Grupo')).toBeInTheDocument();
    expect(screen.getByText('Prob. éxito:')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('¿Por qué fue exitosa?')).toBeInTheDocument();
    expect(screen.getByText('Test Evaluacion')).toBeInTheDocument();
  });

  it('does not render when there is no suggestion', () => {
    render(<Sugerencia sugerencia={null} />);
    expect(screen.queryByText('Sugerencia de política')).not.toBeInTheDocument();
  });

  it('renders correctly without evaluacion', () => {
    const sugerenciaSinEvaluacion = {
        "Objetivo principal": "Test Objetivo",
        "Grupo": "Test Grupo",
        "Probabilidad_exito": 90,
      };
    render(<Sugerencia sugerencia={sugerenciaSinEvaluacion} />);

    expect(screen.getByText('Sugerencia de política')).toBeInTheDocument();
    expect(screen.queryByText('¿Por qué fue exitosa?')).not.toBeInTheDocument();
  });
});
