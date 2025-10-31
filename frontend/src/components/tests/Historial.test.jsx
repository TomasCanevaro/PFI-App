import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Historial from '../Historial';

describe('Historial', () => {
  const mockHistorial = [
    {
      _id: '1',
      objetivo: 'Reducir la pobreza',
      grupo: 'Jóvenes',
      prediccion: 'Éxito',
      probabilidad_exito: 85,
      resultado_real: 'Éxito',
      fecha: '2023-01-01',
    },
    {
      _id: '2',
      objetivo: 'Mejorar educación',
      grupo: 'Niños',
      prediccion: 'Fracaso',
      probabilidad_exito: 30,
      resultado_real: 'Fracaso',
      fecha: '2023-02-01',
    },
  ];

  it('renders the Historial title', () => {
    render(<Historial historial={[]} onDelete={() => {}} />);
    expect(screen.getByText('Historial')).toBeInTheDocument();
  });

  it('displays "No hay registros." when historial is empty', () => {
    render(<Historial historial={[]} onDelete={() => {}} />);
    fireEvent.click(screen.getByText('Mostrar')); // Show the content
    expect(screen.getByText('No hay registros.')).toBeInTheDocument();
  });

  it('displays historial items when provided', () => {
    render(<Historial historial={mockHistorial} onDelete={() => {}} />);
    fireEvent.click(screen.getByText('Mostrar')); // Show the content
    expect(screen.getByText('Reducir la pobreza')).toBeInTheDocument();
    expect(screen.getByText('Mejorar educación')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('toggles visibility when "Mostrar/Ocultar" button is clicked', () => {
    render(<Historial historial={mockHistorial} onDelete={() => {}} />);
    const toggleButton = screen.getByText('Mostrar');
    fireEvent.click(toggleButton);
    expect(screen.getByText('Reducir la pobreza')).toBeInTheDocument(); // Content is visible
    expect(toggleButton).toHaveTextContent('Ocultar');

    fireEvent.click(toggleButton);
    expect(screen.queryByText('Reducir la pobreza')).not.toBeInTheDocument(); // Content is hidden
    expect(toggleButton).toHaveTextContent('Mostrar');
  });

  it('calls onDelete with the correct id when "Eliminar" button is clicked', () => {
    const mockOnDelete = vi.fn();
    render(<Historial historial={mockHistorial} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByText('Mostrar')); // Show the content
    const deleteButtons = screen.getAllByText('Eliminar');
    fireEvent.click(deleteButtons[0]);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });
});