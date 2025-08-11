import { useState } from 'react';
import './App.css';

function App() {
  const [objetivo, setObjetivo] = useState("");
  const [grupo, setGrupo] = useState("");
  const [resultado, setResultado] = useState(null);

  const gruposDisponibles = [
    "Seguridad / TIC",
    "Infraestructura / Ambiente",
    "Educación / Obras públicas",
    "Movilidad / Infraestructura",
    "Economía / Salud industrial",
    "Urbanismo / Infraestructura",
    "Seguridad ciudadana",
    "Gestión municipal",
    "Transporte / Obra pública",
    "Economía local / Subsidio"
  ];

  const handlePredict = async (e) => {
    e.preventDefault();
    setResultado(null);

    const res = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "Objetivo principal": objetivo,
        "Grupo": grupo
      })
    });

    const data = await res.json();
    setResultado(data);
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <h1>Evaluar Política Pública</h1>
        <form onSubmit={handlePredict}>
          <div>
            <label>Objetivo principal:</label>
            <input
              type="text"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Grupo:</label>
            <select
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

        {resultado && (
          <div className="result">
            <h2>Resultado</h2>
            <p><strong>Predicción:</strong> {resultado.prediccion}</p>
            <p><strong>Probabilidad de éxito:</strong> {resultado.probabilidad_exito}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;