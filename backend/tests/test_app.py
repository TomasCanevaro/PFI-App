import json
import unittest
from unittest.mock import MagicMock, patch

import pandas as pd
import numpy as np
from bson import ObjectId
from flask_jwt_extended import create_access_token

with patch("joblib.load", return_value=MagicMock()):
    from app import app, modelo


CATALOGO = pd.DataFrame([
    {"problema_id": 1, "municipio_id": 1, "problema": "Falta de salud", "categoria_problema": "Salud", "nivel_severidad": 8, "poblacion_afectada": 1000, "politica": "Centro de salud", "categoria_politica": "Salud", "costo_estimado": 100, "tiempo_implementacion_meses": 4, "dificultad_implementacion": 30, "nivel_evidencia": 90, "activa": True, "aplicable": True},
    {"problema_id": 1, "municipio_id": 1, "problema": "Falta de salud", "categoria_problema": "Salud", "nivel_severidad": 8, "poblacion_afectada": 1000, "politica": "Taller deportivo", "categoria_politica": "Deportes", "costo_estimado": 200, "tiempo_implementacion_meses": 6, "dificultad_implementacion": 40, "nivel_evidencia": 75, "activa": True, "aplicable": True},
])


class TestApp(unittest.TestCase):
    def setUp(self):
        app.config.update(TESTING=True, JWT_SECRET_KEY="test_secret_key_with_at_least_32_bytes")
        self.client = app.test_client()
        with app.app_context():
            token = create_access_token(identity=str(ObjectId()))
        self.headers = {"Authorization": f"Bearer {token}"}
        self.usuarios = patch("app.usuarios_col").start()
        self.predicciones = patch("app.predicciones_col").start()
        self.read_csv = patch("app.pd.read_csv", return_value=CATALOGO).start()
        modelo.predict_proba.return_value = np.array([[0.2, 0.8], [0.8, 0.2]])

    def tearDown(self):
        patch.stopall()

    def test_catalog_returns_municipal_problems(self):
        response = self.client.get("/catalog", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["problemas"][0]["municipio_id"], 1)
        self.assertEqual(data["problemas"][0]["problema"], "Falta de salud")

    def test_predict_ranks_candidates_with_model(self):
        response = self.client.post("/predict", data=json.dumps({"problema_id": 1, "municipio_id": 1}), content_type="application/json", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["politica_recomendada"], "Centro de salud")
        self.assertEqual(data["puntaje_recomendacion"], 80.0)
        modelo.predict_proba.assert_called_once()

    def test_predict_rejects_incomplete_input(self):
        response = self.client.post("/predict", data=json.dumps({"problema_id": 1}), content_type="application/json", headers=self.headers)
        self.assertEqual(response.status_code, 400)

    def test_save_persists_recommendation(self):
        payload = {"problema": "Falta de salud", "municipio_id": 1, "politica_recomendada": "Centro de salud", "puntaje_recomendacion": 80}
        response = self.client.post("/save", data=json.dumps(payload), content_type="application/json", headers=self.headers)
        self.assertEqual(response.status_code, 201)
        saved = self.predicciones.insert_one.call_args.args[0]
        self.assertEqual(saved["politica_recomendada"], "Centro de salud")

    def test_register_and_login(self):
        self.usuarios.find_one.return_value = None
        response = self.client.post("/register", json={"username": "ana", "password": "clave"})
        self.assertEqual(response.status_code, 201)
        self.usuarios.find_one.return_value = {"_id": ObjectId(), "username": "ana", "password": "hash"}
        with patch("app.bcrypt.check_password_hash", return_value=True):
            response = self.client.post("/login", json={"username": "ana", "password": "clave"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.get_json())


if __name__ == "__main__":
    unittest.main()
