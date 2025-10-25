import unittest
from unittest.mock import patch, MagicMock
import json
import pandas as pd
from bson import ObjectId
import joblib

with patch('joblib.load') as mock_joblib_load:
    mock_model = MagicMock()
    mock_joblib_load.return_value = mock_model
    from app import app

class TestApp(unittest.TestCase):

    def setUp(self):
        app.config['TESTING'] = True
        app.config['JWT_SECRET_KEY'] = 'test_secret'
        self.app = app.test_client()

        # Mocking external dependencies
        self.mock_mongo_client = patch('app.MongoClient').start()
        self.mock_db = self.mock_mongo_client.return_value.__getitem__.return_value
        self.mock_usuarios_col = self.mock_db.__getitem__.return_value
        self.mock_predicciones_col = self.mock_db.__getitem__.return_value
        
        self.mock_pd_read_csv = patch('app.pd.read_csv').start()
        self.mock_df = pd.DataFrame({
            'Grupo': ['Grupo A', 'Grupo B'],
            'Objetivo principal': ['Objetivo 1', 'Objetivo 2'],
            'Evaluación': ['Éxito: Razón 1', 'Fracaso: Razón 2']
        })
        self.mock_pd_read_csv.return_value = self.mock_df


    def tearDown(self):
        patch.stopall()

    def test_register_success(self):
        with patch('app.usuarios_col.find_one', return_value=None):
            response = self.app.post('/register', 
                                     data=json.dumps({'username': 'testuser', 'password': 'password'}),
                                     content_type='application/json')
            self.assertEqual(response.status_code, 201)
            data = json.loads(response.data)
            self.assertEqual(data['message'], 'Usuario registrado con éxito')

    def test_register_user_exists(self):
        self.mock_usuarios_col.find_one.return_value = {'username': 'testuser'}
        response = self.app.post('/register',
                                 data=json.dumps({'username': 'testuser', 'password': 'password'}),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'Usuario ya existe')

    def test_login_success(self):
        hashed_pw = '$2b$12$0Z... (a valid bcrypt hash)'
        self.mock_usuarios_col.find_one.return_value = {'_id': ObjectId(), 'username': 'testuser', 'password': hashed_pw}
        
        with patch('app.bcrypt.check_password_hash', return_value=True):
            response = self.app.post('/login',
                                     data=json.dumps({'username': 'testuser', 'password': 'password'}),
                                     content_type='application/json')
            self.assertEqual(response.status_code, 200)
            self.assertIn('token', response.get_data(as_text=True))

    def test_login_invalid_credentials(self):
        self.mock_usuarios_col.find_one.return_value = None
        with patch('app.bcrypt.check_password_hash', return_value=False):
            response = self.app.post('/login',
                                     data=json.dumps({'username': 'wronguser', 'password': 'wrongpassword'}),
                                     content_type='application/json')
            self.assertEqual(response.status_code, 401)
            data = json.loads(response.data)
            self.assertEqual(data['error'], 'Credenciales inválidas')

    @patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')
    def test_predict_success(self, mock_jwt):
        mock_model.predict.return_value = [1]
        mock_model.predict_proba.return_value = [[0.123, 0.877]]
        
        with patch('app.get_jwt_identity') as mock_get_jwt_identity:
            mock_get_jwt_identity.return_value = str(ObjectId())
            response = self.app.post('/predict',
                                     data=json.dumps({'Objetivo principal': 'Test Objetivo', 'Grupo': 'Test Grupo'}),
                                     content_type='application/json')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.get_data(as_text=True))
            self.assertEqual(data['prediccion'], 'Éxito')
            self.assertEqual(data['probabilidad_exito'], 87.7)

    @patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')
    def test_predict_missing_fields(self, mock_jwt):
        with patch('app.get_jwt_identity') as mock_get_jwt_identity:
            mock_get_jwt_identity.return_value = str(ObjectId())
            response = self.app.post('/predict',
                                     data=json.dumps({'Grupo': 'Test Grupo'}),
                                     content_type='application/json')
            self.assertEqual(response.status_code, 400)
            data = json.loads(response.data)
            self.assertEqual(data['error'], 'Faltan campos requeridos')

    def test_ping_db_success(self):
        with patch('app.db.command', return_value={'ok': 1}):
            response = self.app.get('/ping-db')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(data['message'], 'Conexión exitosa a MongoDB')

    def test_ping_db_failure(self):
        with patch('app.db.command', side_effect=Exception("Connection error")):
            response = self.app.get('/ping-db')
            self.assertEqual(response.status_code, 500)
            data = json.loads(response.data)
            self.assertEqual(data['error'], 'Connection error')


if __name__ == '__main__':
    unittest.main()