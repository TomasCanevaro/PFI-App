import React from 'react';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from "../utils/api";

function Historial({ historial, onDelete }) {
    const [mostrarHistorial, setMostrarHistorial] = useState(false);

    return (
        <div className="historial-container">
            <div className="historial-header">
                <h2 className="historial-title">Historial</h2>
                <button 
                    className="toggle-btn"
                    onClick={() => setMostrarHistorial(!mostrarHistorial)}>
                {mostrarHistorial ? "Ocultar" : "Mostrar"}
                </button>
            </div>

        {mostrarHistorial && (
            <div>
            {historial.length === 0 ? (
                <p>No hay registros.</p>
            ) : (
                <table className="historial-table">
                <thead>
                    <tr>
                    <th>Objetivo</th>
                    <th>Grupo</th>
                    <th>Predicción</th>
                    <th>Prob. Éxito</th>
                    <th>Resultado Real</th>
                    <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {historial.map((item, idx) => (
                    <tr key={idx}>
                        <td>{item["objetivo"]}</td>
                        <td>{item["grupo"]}</td>
                        <td>{item["prediccion"]}</td>
                        <td>{item["probabilidad_exito"]}%</td>
                        <td>{item["resultado_real"]}</td>
                        <td>{item["fecha"]}</td>
                        <td><button 
                            className="delete-btn"
                            onClick={() => onDelete(item._id)}
                            >
                            Eliminar
                        </button></td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
                
            </div>
        )}
        </div>
    );
}

export default Historial;