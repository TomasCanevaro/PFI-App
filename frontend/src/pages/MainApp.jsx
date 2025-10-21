import { useState, useEffect } from 'react';
import { fetchWithAuth } from "../utils/api";
import Historial from '../components/Historial';
import '../App.css';

function MainApp() {
  const [objetivo, setObjetivo] = useState("");
  const [grupo, setGrupo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [sugerencia, setSugerencia] = useState(null);

  const token = localStorage.getItem("token");

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

  useEffect(() => {
    obtenerHistorial();
  }, []);

  const obtenerHistorial = async () => {
    const res = await fetchWithAuth("http://127.0.0.1:5000/history");
    if (res && res.ok) {
      const data = await res.json();
      setHistorial(data);
    }
  };

  const eliminarRegistro = async (id) => {
    const confirmacion = window.confirm("¿Seguro que querés eliminar este registro?");
    if (!confirmacion) return;

    const res = await fetch(`http://127.0.0.1:5000/history/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    if (res.ok) {
      alert("Registro eliminado");
      obtenerHistorial(); // vuelve a cargar el historial
    } else {
      alert("No se pudo eliminar");
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setResultado(null);
    setSugerencia(null);

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

    // 🔹 Pedir sugerencia al backend
    const suggestRes = await fetch("http://127.0.0.1:5000/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "Grupo": grupo })
    });

    const suggestData = await suggestRes.json();
    setSugerencia(suggestData);
  };

  const guardarResultado = async (resultadoReal) => {
    if (!resultado) return;

    await fetchWithAuth("http://127.0.0.1:5000/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        "Objetivo principal": objetivo,
        "Grupo": grupo,
        "Prediccion": resultado.prediccion,
        "Probabilidad_exito": resultado.probabilidad_exito,
        "Resultado_real": resultadoReal
      })
    });

    obtenerHistorial();
    setResultado(null);
    setSugerencia(null);
    setObjetivo("");
    setGrupo("");
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
            <div>
              <button onClick={() => guardarResultado("Éxito")}>Marcar como Éxito</button>
              <button onClick={() => guardarResultado("Fracaso")}>Marcar como Fracaso</button>
            </div>
          </div>
        )}

        {sugerencia && (
          <div className="suggestion">
            <h2>Sugerencia de política</h2>
            <p><strong>Objetivo:</strong> {sugerencia["Objetivo principal"]}</p>
            <p><strong>Grupo:</strong> {sugerencia["Grupo"]}</p>
            <p><strong>Prob. éxito:</strong> {sugerencia["Probabilidad_exito"]}%</p>

            {sugerencia["Evaluacion"] && (
              <p><strong>¿Por qué fue exitosa?</strong> {sugerencia["Evaluacion"]}</p>
            )}
          </div>
        )}

        <Historial historial={historial} onDelete={eliminarRegistro} />
      </div>
    </div>
  );
}

export default MainApp;