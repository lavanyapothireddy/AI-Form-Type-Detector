import joblib
import os

# Lazy-load model to avoid crash on import if model file doesn't exist yet
_model = None

MODEL_PATH = os.environ.get("MODEL_PATH", "model/form_classifier.pkl")


def _get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model file not found at '{MODEL_PATH}'. "
                "Please run train_model.py first to generate the model."
            )
        _model = joblib.load(MODEL_PATH)
    return _model


def detect_form_type(text: str) -> dict:
    model = _get_model()

    prediction = model.predict([text])[0]
    probabilities = model.predict_proba([text])[0]
    confidence = float(max(probabilities)) * 100

    # Get top-3 predictions with confidence scores
    classes = model.classes_
    class_probs = sorted(
        zip(classes, probabilities),
        key=lambda x: x[1],
        reverse=True
    )
    top_predictions = [
        {"form_type": cls, "confidence": round(float(prob) * 100, 2)}
        for cls, prob in class_probs[:3]
    ]

    return {
        "form_type": str(prediction),
        "confidence": round(confidence, 2),
        "top_predictions": top_predictions
    }
