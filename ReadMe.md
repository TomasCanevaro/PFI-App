# Recomendador de políticas públicas

La aplicación recomienda y ordena políticas candidatas para un problema municipal. El usuario selecciona un problema del catálogo y el backend puntúa las alternativas aplicables con un modelo de aprendizaje automático.

## Dataset y modelo

El dataset canónico está en `backend/data/dataset_entrenamiento.csv` y contiene 370 registros con la etiqueta `politica_ganadora`.

Para reentrenar desde la raíz del proyecto:

```powershell
cd modelo
python main.py
Copy-Item modelo_recomendador_politicas.pkl ..\\backend\\modelo_recomendador_politicas.pkl
```

El script compara Regresión Logística y Random Forest. Evalúa con `GroupKFold` de cinco pliegues agrupados por `problema_id`, para que las políticas candidatas de un mismo problema no se dividan entre entrenamiento y evaluación. El resultado reproducible queda en `modelo/metricas_modelo.json`.

Las métricas deben informarse exactamente como figuren en ese archivo. El dataset actual solo contiene `municipio_id = 1`; la aplicación incorpora la dimensión municipal en su contrato y catálogo, pero para recomendar entre municipios distintos se necesitan datos de más municipios.

## Backend

Crear `backend/.env` con:

```env
MONGO_URI=mongodb://localhost:27017/
JWT_SECRET_KEY=clave_super_segura
```

Luego ejecutar:

```powershell
cd backend
pip install -r requirements.txt
python app.py
```

Pruebas del backend:

```powershell
python -m unittest discover tests
```

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Pruebas y compilación:

```powershell
npm run test -- --run
npm run build
```
