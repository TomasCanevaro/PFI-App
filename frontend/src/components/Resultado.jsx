import React from 'react';

const Resultado = ({ resultado, guardarResultado }) => {
  if (!resultado) return null;

  return (
    <div className="result">
      <h2>Resultado</h2>
      <p><strong>Predicción:</strong> {resultado.prediccion}</p>
      <p><strong>Probabilidad de éxito:</strong> {resultado.probabilidad_exito}%</p>
      <div>
        <button onClick={() => guardarResultado("Éxito")}>Marcar como Éxito</button>
        <button onClick={() => guardarResultado("Fracaso")}>Marcar como Fracaso</button>
      </div>
    </div>
  );
};

export default Resultado;
