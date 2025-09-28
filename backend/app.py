from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import json
import joblib
import pandas as pd
from datetime import datetime, timedelta
import os
import random

# Inicializar Flask
app = Flask(__name__)
CORS(app)  # Permite que React (localhost:5173) llame al backend
bcrypt = Bcrypt(app)
app.config["JWT_SECRET_KEY"] = "clave_secreta_super_segura"  # cambia esto en producción
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

# Cargar el modelo entrenado
modelo = joblib.load("modelo_randomforest_politicas.pkl")

# Archivo donde guardaremos el historial
HISTORIAL_FILE = "historial_politicas.csv"

USERS_FILE = "usuarios.json"

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

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)

# Registro de usuario
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    users = load_users()

    if username in users:
        return jsonify({"error": "Usuario ya existe"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")
    users[username] = {"password": hashed_pw, "created_at": str(datetime.now())}
    save_users(users)

    return jsonify({"message": "Usuario registrado con éxito"}), 201

# Login de usuario
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    users = load_users()

    if username not in users or not bcrypt.check_password_hash(users[username]["password"], password):
        return jsonify({"error": "Credenciales inválidas"}), 401

    token = create_access_token(identity=username)
    return jsonify({"token": token, "username": username})

# --- Endpoint de predicción ---
@app.route("/predict", methods=["POST"])
#@jwt_required()
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
#@jwt_required()
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

@app.route("/suggest", methods=["POST"])
def suggest():
    data = request.json
    grupo_usuario = data.get("Grupo")

    # Leer dataset original
    df = pd.read_csv("Tabla_Politicas_Publicas.csv", encoding="latin-1", sep=";")

    # Filtrar políticas exitosas del mismo grupo
    exitosas = df[
        (df["Grupo"] == grupo_usuario) &
        (df["Evaluación"].str.contains("Éxito", na=False))
    ]

    if exitosas.empty:
        return jsonify({"mensaje": "No hay sugerencias para este grupo"}), 200

    # Elegir un objetivo exitoso de ese grupo
    objetivo = random.choice(exitosas["Objetivo principal"].dropna().tolist())

    candidato = {
        "Objetivo principal": objetivo,
        "Grupo": grupo_usuario
    }

    prob = modelo.predict_proba(pd.DataFrame([candidato]))[0][1]

    sugerencia = {
        **candidato,
        "Probabilidad_exito": round(prob * 100, 2)
    }

    return jsonify(sugerencia)


@app.route("/history", methods=["GET"])
#@jwt_required()
def history():
    if not os.path.exists(HISTORIAL_FILE):
        return jsonify([])

    df = pd.read_csv(HISTORIAL_FILE)
    return jsonify(df.to_dict(orient="records"))

# --- Ejecutar Flask ---
if __name__ == "__main__":
    app.run(debug=True)
