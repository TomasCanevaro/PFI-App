import React from 'react';

const Resultado = ({ resultado, guardarResultado }) => {
  if (!resultado) return null;
  return (
    <section className="result" aria-live="polite">
      <h2>Política recomendada</h2>
      <p><strong>Política:</strong> {resultado.politica_recomendada}</p>
      <p><strong>Categoría:</strong> {resultado.categoria_politica}</p>
      <p><strong>Puntaje del modelo:</strong> {resultado.puntaje_recomendacion}%</p>
      <p><strong>Costo estimado:</strong> ${Number(resultado.costo_estimado).toLocaleString('es-AR')}</p>
      <p><strong>Tiempo estimado:</strong> {resultado.tiempo_implementacion_meses} meses</p>
      <p><strong>Dificultad:</strong> {resultado.dificultad_implementacion}</p>
      {resultado.alternativas?.length > 1 && <div><h3>Alternativas mejor puntuadas</h3><ol>
        {resultado.alternativas.slice(1).map((item) => <li key={item.politica}>{item.politica} ({item.puntaje_recomendacion}%)</li>)}
      </ol></div>}
      <div>
        <button onClick={() => guardarResultado('Implementada')}>Marcar como implementada</button>
        <button onClick={() => guardarResultado('No implementada')}>Marcar como no implementada</button>
      </div>
    </section>
  );
};

export default Resultado;
