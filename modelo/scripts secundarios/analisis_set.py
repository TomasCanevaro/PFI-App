"""Resumen del dataset usado por el recomendador."""
from pathlib import Path

import pandas as pd

dataset = Path(__file__).resolve().parents[1] / "data" / "dataset_entrenamiento.csv"
df = pd.read_csv(dataset)

print("Filas y columnas:", df.shape)
print("Columnas:", df.columns.tolist())
print("Distribución de politica_ganadora:")
print(df["politica_ganadora"].value_counts())
print("Problemas por municipio:")
print(df[["municipio_id", "problema_id", "problema"]].drop_duplicates().to_string(index=False))
