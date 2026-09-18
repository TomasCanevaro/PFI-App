import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../utils/api';
import Historial from '../components/Historial';
import PoliticaForm from '../components/PoliticaForm';
import Resultado from '../components/Resultado';
import '../App.css';

function MainApp() {
  const [problemas, setProblemas] = useState([]);
  const [problemaId, setProblemaId] = useState('');
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState('');
  const obtenerHistorial = async () => { const res = await fetchWithAuth('/history'); if (res?.ok) setHistorial(await res.json()); };
  const obtenerCatalogo = async () => {
    const res = await fetchWithAuth('/catalog');
    if (!res?.ok) return;
    const data = await res.json();
    setProblemas(Array.isArray(data.problemas) ? data.problemas : []);
  };
  useEffect(() => { obtenerHistorial(); obtenerCatalogo(); }, []);
  const eliminarRegistro = async (id) => { if (!window.confirm('¿Seguro que querés eliminar este registro?')) return; const res = await fetchWithAuth(`/history/${id}`, { method: 'DELETE' }); if (res?.ok) obtenerHistorial(); };
  const handlePredict = async (event) => {
    event.preventDefault(); setResultado(null); setError('');
    const problema = problemas.find((item) => String(item.problema_id) === String(problemaId));
    if (!problema) return;
    const res = await fetchWithAuth('/predict', { method: 'POST', body: JSON.stringify({ problema_id: problema.problema_id, municipio_id: problema.municipio_id }) });
    const data = await res?.json();
    if (!res?.ok) { setError(data?.error ?? 'No se pudo generar la recomendación.'); return; }
    setResultado(data);
  };
  const guardarResultado = async (resultadoReal) => {
    if (!resultado) return;
    const res = await fetchWithAuth('/save', { method: 'POST', body: JSON.stringify({ ...resultado, resultado_real: resultadoReal }) });
    if (res?.ok) { await obtenerHistorial(); setResultado(null); setProblemaId(''); }
  };
  return <div className="container"><main className="form-wrapper">
    <h1>Recomendar Política Pública</h1><p>Seleccioná un problema del municipio para ordenar las políticas candidatas.</p>
    <PoliticaForm problemas={problemas} problemaId={problemaId} setProblemaId={setProblemaId} handlePredict={handlePredict} />
    {error && <p role="alert">{error}</p>}<Resultado resultado={resultado} guardarResultado={guardarResultado} /><Historial historial={historial} onDelete={eliminarRegistro} />
  </main></div>;
}

export default MainApp;
