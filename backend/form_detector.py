import os
import joblib

MODEL_PATH = 'model/form_classifier.pkl'

if not os.path.exists(MODEL_PATH):
    raise Exception(
        "Model file not found. Run train_model.py first."
    )

model = joblib.load(MODEL_PATH)

def detect_form_type(text):

    prediction = model.predict([text])[0]

    probabilities = model.predict_proba([text])[0]

    confidence = max(probabilities) * 100

    return {
        "form_type": prediction,
        "confidence": round(confidence, 2)
    }
