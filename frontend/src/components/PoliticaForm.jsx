import React from 'react';

const PoliticaForm = ({ problemas = [], problemaId, setProblemaId, handlePredict }) => {
  const problemaSeleccionado = problemas.find((item) => String(item.problema_id) === String(problemaId));
  return (
    <form onSubmit={handlePredict}>
      <div>
        <label htmlFor="problema">Problema municipal:</label>
        <select id="problema" value={problemaId} onChange={(event) => setProblemaId(event.target.value)} required>
          <option value="">-- Seleccioná un problema --</option>
          {problemas.map((item) => <option key={item.problema_id} value={item.problema_id}>{item.problema}</option>)}
        </select>
      </div>
      {problemaSeleccionado && <div className="problem-details" aria-live="polite">
        <p><strong>Municipio:</strong> {problemaSeleccionado.municipio_id}</p>
        <p><strong>Categoría:</strong> {problemaSeleccionado.categoria_problema}</p>
        <p><strong>Severidad:</strong> {problemaSeleccionado.nivel_severidad}</p>
        <p><strong>Población afectada:</strong> {Number(problemaSeleccionado.poblacion_afectada).toLocaleString('es-AR')}</p>
      </div>}
      <button type="submit" disabled={!problemaId}>Recomendar política</button>
    </form>
  );
};

export default PoliticaForm;
