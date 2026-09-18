import React, { useState } from 'react';

function Historial({ historial, onDelete }) {
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  return (
    <section className="historial-container">
      <div className="historial-header"><h2 className="historial-title">Historial</h2>
        <button className="toggle-btn" onClick={() => setMostrarHistorial(!mostrarHistorial)}>{mostrarHistorial ? 'Ocultar' : 'Mostrar'}</button>
      </div>
      {mostrarHistorial && (historial.length === 0 ? <p>No hay registros.</p> : <table className="historial-table">
        <thead><tr><th>Problema</th><th>Municipio</th><th>Política recomendada</th><th>Puntaje</th><th>Resultado real</th><th>Fecha</th><th>Acción</th></tr></thead>
        <tbody>{historial.map((item) => <tr key={item._id}>
          <td>{item.problema}</td><td>{item.municipio_id}</td><td>{item.politica_recomendada}</td><td>{item.puntaje_recomendacion}%</td>
          <td>{item.resultado_real}</td><td>{item.fecha}</td><td><button className="delete-btn" onClick={() => onDelete(item._id)}>Eliminar</button></td>
        </tr>)}</tbody>
      </table>)}
    </section>
  );
}

export default Historial;
