"""Ejemplo de ranking de políticas candidatas para un problema del catálogo."""
from pathlib import Path

import joblib
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
FEATURES = [
    "categoria_problema", "categoria_politica", "nivel_severidad", "poblacion_afectada",
    "costo_estimado", "tiempo_implementacion_meses", "dificultad_implementacion", "nivel_evidencia",
]

modelo = joblib.load(ROOT / "modelo_recomendador_politicas.pkl")
df = pd.read_csv(ROOT / "data" / "dataset_entrenamiento.csv")

# Cambiar estos IDs por un problema y municipio existentes en el dataset.
candidatas = df[(df["problema_id"] == 2) & (df["municipio_id"] == 1)].copy()
candidatas["puntaje_recomendacion"] = modelo.predict_proba(candidatas[FEATURES])[:, 1]

print(candidatas[["politica", "puntaje_recomendacion"]].sort_values("puntaje_recomendacion", ascending=False).head(3).to_string(index=False))
