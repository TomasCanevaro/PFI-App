import React from 'react';

const PoliticaForm = ({
  objetivo,
  setObjetivo,
  grupo,
  setGrupo,
  handlePredict,
  gruposDisponibles,
}) => {
  return (
    <form onSubmit={handlePredict}>
      <div>
        <label htmlFor="objetivo">Objetivo principal:</label>
        <input
          id="objetivo"
          type="text"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="grupo">Grupo:</label>
        <select
          id="grupo"
          value={grupo}
          onChange={(e) => setGrupo(e.target.value)}
          required
        >
          <option value="">-- Selecciona un grupo --</option>
          {gruposDisponibles.map((g, idx) => (
            <option key={idx} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Evaluar</button>
    </form>
  );
};

export default PoliticaForm;
