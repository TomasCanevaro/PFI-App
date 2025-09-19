import joblib
import pandas as pd

# 1. Cargar el modelo entrenado
modelo = joblib.load("modelo_randomforest_politicas.pkl")

# 2. Crear input manual
# Simulamos una política: objetivo + grupo temático
nueva_muestra = pd.DataFrame([{
    'Objetivo principal': "Crear centros de salud mental en escuelas",  # texto libre
    'Grupo': "Salud / Educación"  # debe parecerse a los que había en el CSV
}])

# 3. Hacer la predicción
prediccion = modelo.predict(nueva_muestra)
proba = modelo.predict_proba(nueva_muestra)

# 4. Mostrar resultados
print("Resultado predicho:", "Éxito" if prediccion[0] == 1 else "Fracaso")
print(f"Probabilidades: Fracaso={proba[0][0]*100:.2f}% | Éxito={proba[0][1]*100:.2f}%")
