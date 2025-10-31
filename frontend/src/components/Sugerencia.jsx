import React from 'react';

const Sugerencia = ({ sugerencia }) => {
  if (!sugerencia) return null;

  return (
    <div className="suggestion">
      <h2>Sugerencia de política</h2>
      <p><strong>Objetivo:</strong> {sugerencia["Objetivo principal"]}</p>
      <p><strong>Grupo:</strong> {sugerencia["Grupo"]}</p>
      <p><strong>Prob. éxito:</strong> {sugerencia["Probabilidad_exito"]}%</p>

      {sugerencia["Evaluacion"] && (
        <p><strong>¿Por qué fue exitosa?</strong> {sugerencia["Evaluacion"]}</p>
      )}
    </div>
  );
};

export default Sugerencia;
