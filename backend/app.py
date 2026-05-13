from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

# ---------------------------
# TRAIN MODEL DURING STARTUP
# ---------------------------

df = pd.read_csv("dataset/forms_dataset.csv")

X = df["text"]
y = df["label"]

model = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', MultinomialNB())
])

model.fit(X, y)

# ---------------------------
# FASTAPI
# ---------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "AI Form Type Detector Running"
    }

@app.post("/detect-text")
async def detect_text(data: dict):

    text = data.get("text", "")

    prediction = model.predict([text])[0]

    probabilities = model.predict_proba([text])[0]

    confidence = max(probabilities) * 100

    return {
        "form_type": prediction,
        "confidence": round(confidence, 2)
    }
