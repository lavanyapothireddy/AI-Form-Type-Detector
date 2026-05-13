import joblib

model = joblib.load('model/form_classifier.pkl')

def detect_form_type(text):
    prediction = model.predict([text])[0]

    probabilities = model.predict_proba([text])[0]
    confidence = max(probabilities) * 100

    return {
        "form_type": prediction,
        "confidence": round(confidence, 2)
    }
