"""Entrena y evalúa el recomendador de políticas públicas."""
from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, roc_auc_score
from sklearn.model_selection import GroupKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parent
DATASET_PATH = ROOT / "data" / "dataset_entrenamiento.csv"
MODEL_PATH = ROOT / "modelo_recomendador_politicas.pkl"
METRICS_PATH = ROOT / "metricas_modelo.json"
TARGET = "politica_ganadora"
CATEGORICAL_FEATURES = ["categoria_problema", "categoria_politica"]
NUMERIC_FEATURES = [
    "nivel_severidad", "poblacion_afectada", "costo_estimado",
    "tiempo_implementacion_meses", "dificultad_implementacion", "nivel_evidencia",
]
FEATURES = CATEGORICAL_FEATURES + NUMERIC_FEATURES


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer([
        ("categorias", Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore")),
        ]), CATEGORICAL_FEATURES),
        ("numericas", Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]), NUMERIC_FEATURES),
    ])


def build_models() -> dict[str, Pipeline]:
    return {
        "regresion_logistica": Pipeline([
            ("preprocesamiento", build_preprocessor()),
            ("clasificador", LogisticRegression(class_weight="balanced", max_iter=2000, random_state=42)),
        ]),
        "random_forest": Pipeline([
            ("preprocesamiento", build_preprocessor()),
            ("clasificador", RandomForestClassifier(
                n_estimators=300, class_weight="balanced", min_samples_leaf=2, random_state=42,
            )),
        ]),
    }


def grouped_oof_metrics(model: Pipeline, X: pd.DataFrame, y: pd.Series, groups: pd.Series) -> dict[str, float]:
    """Evalúa sin dividir candidatos de un mismo problema entre train y test."""
    probabilities = pd.Series(index=X.index, dtype=float)
    for train_idx, test_idx in GroupKFold(n_splits=5).split(X, y, groups):
        model.fit(X.iloc[train_idx], y.iloc[train_idx])
        probabilities.iloc[test_idx] = model.predict_proba(X.iloc[test_idx])[:, 1]
    predictions = (probabilities >= 0.5).astype(int)
    precision, recall, f1, _ = precision_recall_fscore_support(y, predictions, average="binary", zero_division=0)
    return {
        "accuracy": round(float(accuracy_score(y, predictions)), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1": round(float(f1), 4),
        "auc": round(float(roc_auc_score(y, probabilities)), 4),
    }


def main() -> None:
    df = pd.read_csv(DATASET_PATH)
    missing = set(FEATURES + [TARGET, "problema_id"]) - set(df.columns)
    if missing:
        raise ValueError(f"Faltan columnas requeridas: {sorted(missing)}")
    X, y, groups = df[FEATURES].copy(), df[TARGET].astype(int), df["problema_id"]
    models = build_models()
    metrics = {name: grouped_oof_metrics(model, X, y, groups) for name, model in models.items()}
    selected_name = max(metrics, key=lambda name: metrics[name]["f1"])
    selected_model = models[selected_name].fit(X, y)
    joblib.dump(selected_model, MODEL_PATH)
    report = {
        "dataset": {"filas": int(len(df)), "variables_predictoras": FEATURES, "etiqueta": TARGET},
        "validacion": "GroupKFold de 5 pliegues agrupado por problema_id",
        "metricas": metrics,
        "modelo_seleccionado": selected_name,
        "criterio_seleccion": "mayor F1 de la clase politica_ganadora",
    }
    METRICS_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    print(f"Modelo guardado en {MODEL_PATH}")


if __name__ == "__main__":
    main()
