
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Resultado from '../Resultado';
import { describe, it, expect, vi } from 'vitest';

describe('Resultado', () => {
  const guardarResultado = vi.fn();

  const resultado = {
    prediccion: 'Éxito',
    probabilidad_exito: 80,
  };

  it('renders correctly with results', () => {
    render(<Resultado resultado={resultado} guardarResultado={guardarResultado} />);

    expect(screen.getByText('Resultado')).toBeInTheDocument();
    expect(screen.getByText('Predicción:')).toBeInTheDocument();
    expect(screen.getByText('Éxito')).toBeInTheDocument();
    expect(screen.getByText('Probabilidad de éxito:')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('Marcar como Éxito')).toBeInTheDocument();
    expect(screen.getByText('Marcar como Fracaso')).toBeInTheDocument();
  });

  it('does not render when there are no results', () => {
    render(<Resultado resultado={null} guardarResultado={guardarResultado} />);
    expect(screen.queryByText('Resultado')).not.toBeInTheDocument();
  });

  it('calls guardarResultado with "Éxito" when the success button is clicked', () => {
    render(<Resultado resultado={resultado} guardarResultado={guardarResultado} />);
    fireEvent.click(screen.getByText('Marcar como Éxito'));
    expect(guardarResultado).toHaveBeenCalledWith('Éxito');
  });

  it('calls guardarResultado with "Fracaso" when the failure button is clicked', () => {
    render(<Resultado resultado={resultado} guardarResultado={guardarResultado} />);
    fireEvent.click(screen.getByText('Marcar como Fracaso'));
    expect(guardarResultado).toHaveBeenCalledWith('Fracaso');
  });
});
