from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson import ObjectId
import joblib
import pandas as pd
from datetime import datetime, timedelta
import os

# Inicializar Flask
app = Flask(__name__)
CORS(app)  # Permite que React llame al backend
bcrypt = Bcrypt(app)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

# Conexión a MongoDB
client = MongoClient(os.getenv("MONGO_URI"))
db = client["politicas_db"]  # nombre de base de datos
usuarios_col = db["usuarios"]
predicciones_col = db["predicciones"]

# Cargar el modelo entrenado
modelo = joblib.load("modelo_randomforest_politicas.pkl")

# Registro de usuario
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if usuarios_col.find_one({"username": username}):
        return jsonify({"error": "Usuario ya existe"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    usuarios_col.insert_one({
        "username": username,
        "password": hashed_pw,
        "created_at": datetime.now()
    })

    return jsonify({"message": "Usuario registrado con éxito"}), 201

# Login de usuario
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    user = usuarios_col.find_one({"username": username})
    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "Credenciales inválidas"}), 401

    token = create_access_token(identity=str(user["_id"]))
    return jsonify({"token": token, "username": username})

# Endpoint de predicción
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

    return jsonify({
        "prediccion": "Éxito" if pred == 1 else "Fracaso",
        "probabilidad_exito": round(proba * 100, 2)
    })

# Endpoint para guardar resultado real
@app.route("/save", methods=["POST"])
@jwt_required()
def save():
    current_user_id = get_jwt_identity()
    data = request.json

    prediccion = {
        "user_id": current_user_id,
        "objetivo": data["Objetivo principal"],
        "grupo": data["Grupo"],
        "prediccion": data["Prediccion"],
        "probabilidad_exito": data["Probabilidad_exito"],
        "resultado_real": data.get("Resultado_real"),
        "fecha": datetime.now()
    }

    predicciones_col.insert_one(prediccion)
    return jsonify({"message": "Predicción guardada con éxito"}), 201

# Endpoint de sugerencia
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

    # Elegir una política exitosa al azar
    fila = exitosas.sample(1).iloc[0]

    objetivo = fila["Objetivo principal"]
    evaluacion = fila["Evaluación"]

    # Extraer explicación posterior a "Éxito:" o "Fracaso:"
    motivo = None
    if isinstance(evaluacion, str):
        if "Éxito:" in evaluacion:
            motivo = evaluacion.split("Éxito:")[1].strip()
        elif "Fracaso:" in evaluacion:
            motivo = evaluacion.split("Fracaso:")[1].strip()

    candidato = {
        "Objetivo principal": objetivo,
        "Grupo": grupo_usuario
    }

    prob = modelo.predict_proba(pd.DataFrame([candidato]))[0][1]

    sugerencia = {
        **candidato,
        "Probabilidad_exito": round(prob * 100, 2),
        "Evaluacion": motivo
    }

    return jsonify(sugerencia)

def serialize_mongo(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@app.route("/history", methods=["GET"])
@jwt_required()
def history():
    current_user_id = get_jwt_identity()

    # Buscar predicciones del usuario
    registros = [serialize_mongo(r) for r in predicciones_col.find({"user_id": current_user_id})]

    for r in registros:
        r["_id"] = str(r["_id"])
        r["timestamp"] = r.get("timestamp").strftime("%Y-%m-%d %H:%M:%S") if r.get("timestamp") else None

    return jsonify(registros)

@app.route("/history/<id>", methods=["DELETE"])
@jwt_required()
def delete_history(id):
    current_user_id = get_jwt_identity()

    try:
        # Intentar eliminar el registro solo si pertenece al usuario logueado
        result = predicciones_col.delete_one({
            "_id": ObjectId(id),
            "user_id": current_user_id
        })

        if result.deleted_count == 0:
            return jsonify({"error": "No se encontró el registro o no pertenece al usuario"}), 404

        return jsonify({"message": "Registro eliminado correctamente"}), 200

    except Exception as e:
        print("Error eliminando registro:", e)
        return jsonify({"error": "Error al eliminar registro"}), 500

@app.route("/ping-db")
def ping_db():
    try:
        db.command("ping")
        return jsonify({"message": "Conexión exitosa a MongoDB"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ejecutar Flask
if __name__ == "__main__":
    app.run(debug=True)