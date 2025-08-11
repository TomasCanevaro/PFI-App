from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from datetime import datetime
import os

# Inicializar Flask
app = Flask(__name__)
CORS(app)  # Permite que React (localhost:5173) llame al backend

# Cargar el modelo entrenado
modelo = joblib.load("modelo_randomforest_politicas.pkl")

# Archivo donde guardaremos el historial
HISTORIAL_FILE = "historial_politicas.csv"

# Crear historial si no existe
if not os.path.exists(HISTORIAL_FILE):
    pd.DataFrame(columns=[
        "Objetivo principal",
        "Grupo",
        "Prediccion",
        "Probabilidad_exito",
        "Resultado_real",
        "Fecha"
    ]).to_csv(HISTORIAL_FILE, index=False)

# --- Endpoint de predicción ---
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    # Validar datos recibidos
    if "Objetivo principal" not in data or "Grupo" not in data:
        return jsonify({"error": "Faltan campos requeridos"}), 400

    # Convertir a DataFrame
    nueva_muestra = pd.DataFrame([{
        "Objetivo principal": data["Objetivo principal"],
        "Grupo": data["Grupo"]
    }])

    # Predicción
    pred = modelo.predict(nueva_muestra)[0]
    proba = modelo.predict_proba(nueva_muestra)[0][1]  # probabilidad de éxito

    # Respuesta
    return jsonify({
        "prediccion": "Éxito" if pred == 1 else "Fracaso",
        "probabilidad_exito": round(proba * 100, 2)
    })

# --- Endpoint para guardar resultado real ---
@app.route("/save", methods=["POST"])
def save():
    data = request.get_json()

    # Validar datos
    required = ["Objetivo principal", "Grupo", "Prediccion", "Probabilidad_exito", "Resultado_real"]
    if not all(k in data for k in required):
        return jsonify({"error": "Faltan campos para guardar"}), 400

    # Cargar historial
    df = pd.read_csv(HISTORIAL_FILE)

    # Agregar nueva fila
    df.loc[len(df)] = [
        data["Objetivo principal"],
        data["Grupo"],
        data["Prediccion"],
        data["Probabilidad_exito"],
        data["Resultado_real"],
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ]

    # Guardar
    df.to_csv(HISTORIAL_FILE, index=False)

    return jsonify({"mensaje": "Registro guardado correctamente"})

# --- Ejecutar Flask ---
if __name__ == "__main__":
    app.run(debug=True)
