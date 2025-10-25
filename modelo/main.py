import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelBinarizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report
from sklearn.pipeline import make_pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
import joblib

# Cargar el CSV
df = pd.read_csv("Tabla_Politicas_Publicas.csv", encoding="latin-1", sep=";")

# Limpiar columnas innecesarias
df = df[['Objetivo principal', 'Grupo', 'Evaluación']].dropna()

# Crear columna binaria: 1 si contiene "Éxito", 0 si contiene "Fracaso"
df['exito'] = df['Evaluación'].apply(lambda x: 1 if "Éxito" in x else 0)

# Separar features y target
X = df[['Objetivo principal', 'Grupo']]
y = df['exito']

# Preprocesamiento: vectorizar texto + codificar categoría
preprocessor = ColumnTransformer(transformers=[
    ('text', TfidfVectorizer(), 'Objetivo principal'),
    ('cat', OneHotEncoder(handle_unknown='ignore'), ['Grupo'])
])

# Pipeline con modelo
pipeline = make_pipeline(preprocessor, RandomForestClassifier(n_estimators=100, random_state=42))

# Entrenar modelo
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
pipeline.fit(X_train, y_train)

# Evaluación
y_pred = pipeline.predict(X_test)
print(classification_report(y_test, y_pred))

# Guardar modelo
joblib.dump(pipeline, "modelo_randomforest_politicas.pkl")
print("Modelo guardado como modelo_randomforest_politicas.pkl")
