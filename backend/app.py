from datetime import datetime, timedelta
from pathlib import Path
import os

import joblib
import pandas as pd
from bson import ObjectId
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from pymongo import MongoClient

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "data" / "dataset_entrenamiento.csv"
MODEL_PATH = BASE_DIR / "modelo_recomendador_politicas.pkl"
FEATURES = [
    "categoria_problema", "categoria_politica", "nivel_severidad", "poblacion_afectada",
    "costo_estimado", "tiempo_implementacion_meses", "dificultad_implementacion", "nivel_evidencia",
]

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)
client = MongoClient(os.getenv("MONGO_URI"))
db = client["politicas_db"]
usuarios_col = db["usuarios"]
predicciones_col = db["predicciones"]
modelo = joblib.load(MODEL_PATH)


def cargar_catalogo() -> pd.DataFrame:
    return pd.read_csv(DATASET_PATH)


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username, password = data.get("username"), data.get("password")
    if not isinstance(username, str) or not username.strip() or not isinstance(password, str) or not password:
        return jsonify({"error": "Usuario y contraseña son obligatorios"}), 400
    if usuarios_col.find_one({"username": username}):
        return jsonify({"error": "Usuario ya existe"}), 400
    usuarios_col.insert_one({"username": username, "password": bcrypt.generate_password_hash(password).decode("utf-8"), "created_at": datetime.now()})
    return jsonify({"message": "Usuario registrado con éxito"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    user = usuarios_col.find_one({"username": data.get("username")})
    if not user or not bcrypt.check_password_hash(user["password"], data.get("password", "")):
        return jsonify({"error": "Credenciales inválidas"}), 401
    return jsonify({"token": create_access_token(identity=str(user["_id"])), "username": user["username"]})


@app.route("/catalog", methods=["GET"])
@jwt_required()
def catalog():
    df = cargar_catalogo()
    columns = ["problema_id", "municipio_id", "problema", "categoria_problema", "nivel_severidad", "poblacion_afectada"]
    problems = df[columns].drop_duplicates().sort_values("problema_id").to_dict(orient="records")
    return jsonify({"problemas": problems})


def recomendar(problema_id: int, municipio_id: int) -> dict | None:
    df = cargar_catalogo()
    candidates = df[(df["problema_id"] == problema_id) & (df["municipio_id"] == municipio_id)].copy()
    if candidates.empty:
        return None
    candidates = candidates[(candidates["activa"].astype(str).str.lower() == "true") & (candidates["aplicable"].astype(str).str.lower() == "true")]
    if candidates.empty:
        return None
    candidates["puntaje_recomendacion"] = modelo.predict_proba(candidates[FEATURES])[:, 1]
    candidates = candidates.sort_values("puntaje_recomendacion", ascending=False)
    best = candidates.iloc[0]
    return {
        "problema": best["problema"], "municipio_id": int(best["municipio_id"]),
        "politica_recomendada": best["politica"], "categoria_politica": best["categoria_politica"],
        "puntaje_recomendacion": round(float(best["puntaje_recomendacion"]) * 100, 2),
        "costo_estimado": float(best["costo_estimado"]),
        "tiempo_implementacion_meses": int(best["tiempo_implementacion_meses"]),
        "dificultad_implementacion": float(best["dificultad_implementacion"]),
        "alternativas": [{"politica": row.politica, "puntaje_recomendacion": round(float(row.puntaje_recomendacion) * 100, 2)} for row in candidates.head(3).itertuples()],
    }


@app.route("/predict", methods=["POST"])
@jwt_required()
def predict():
    data = request.get_json(silent=True) or {}
    try:
        problema_id, municipio_id = int(data.get("problema_id")), int(data.get("municipio_id"))
    except (TypeError, ValueError):
        return jsonify({"error": "problema_id y municipio_id son obligatorios"}), 400
    recommendation = recomendar(problema_id, municipio_id)
    if recommendation is None:
        return jsonify({"error": "No hay políticas aplicables para ese problema y municipio"}), 404
    return jsonify(recommendation)


@app.route("/save", methods=["POST"])
@jwt_required()
def save():
    data = request.get_json(silent=True) or {}
    required = ("problema", "municipio_id", "politica_recomendada", "puntaje_recomendacion")
    if not all(field in data for field in required):
        return jsonify({"error": "Faltan campos requeridos"}), 400
    predicciones_col.insert_one({
        "user_id": get_jwt_identity(), "problema": data["problema"], "municipio_id": data["municipio_id"],
        "politica_recomendada": data["politica_recomendada"], "puntaje_recomendacion": data["puntaje_recomendacion"],
        "resultado_real": data.get("resultado_real"), "fecha": datetime.now(),
    })
    return jsonify({"message": "Recomendación guardada con éxito"}), 201


def serialize_mongo(doc):
    doc["_id"] = str(doc["_id"])
    if isinstance(doc.get("fecha"), datetime):
        doc["fecha"] = doc["fecha"].strftime("%Y-%m-%d %H:%M:%S")
    return doc


@app.route("/history", methods=["GET"])
@jwt_required()
def history():
    return jsonify([serialize_mongo(row) for row in predicciones_col.find({"user_id": get_jwt_identity()})])


@app.route("/history/<id>", methods=["DELETE"])
@jwt_required()
def delete_history(id):
    try:
        result = predicciones_col.delete_one({"_id": ObjectId(id), "user_id": get_jwt_identity()})
    except Exception:
        return jsonify({"error": "Identificador inválido"}), 400
    if result.deleted_count == 0:
        return jsonify({"error": "No se encontró el registro o no pertenece al usuario"}), 404
    return jsonify({"message": "Registro eliminado correctamente"})


@app.route("/ping-db")
def ping_db():
    try:
        db.command("ping")
        return jsonify({"message": "Conexión exitosa a MongoDB"})
    except Exception as error:
        return jsonify({"error": str(error)}), 500


if __name__ == "__main__":
    app.run()
