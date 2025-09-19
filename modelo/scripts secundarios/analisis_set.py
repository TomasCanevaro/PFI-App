import pandas as pd

# Cargar el dataset con encoding correcto
df = pd.read_csv("Tabla_Politicas_Publicas.csv", encoding="latin-1", sep=";")

# Mostrar las primeras filas
print("Primeras filas del dataset:")
print(df.head())

# Mostrar nombres de columnas
print("\nColumnas del dataset:")
print(df.columns.tolist())

# Información general sobre los datos
print("\nResumen de columnas:")
print(df.info())

# Estadísticas básicas
print("\nEstadísticas descriptivas:")
print(df.describe(include='all'))

# Revisar valores únicos por columna (útil para ver clases, categorías, etc.)
print("\nValores únicos por columna:")
for col in df.columns:
    print(f"{col}: {df[col].unique()[:10]}")  # muestra solo los primeros 10 valores únicos
