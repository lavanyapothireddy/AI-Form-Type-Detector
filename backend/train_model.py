import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

# Ensure model directory exists before saving
os.makedirs("model", exist_ok=True)

DATASET_PATH = os.environ.get("DATASET_PATH", "dataset/forms_dataset.csv")

if not os.path.exists(DATASET_PATH):
    raise FileNotFoundError(
        f"Dataset not found at '{DATASET_PATH}'. "
        "Please provide a CSV with 'text' and 'label' columns."
    )

df = pd.read_csv(DATASET_PATH)

if "text" not in df.columns or "label" not in df.columns:
    raise ValueError("Dataset must contain 'text' and 'label' columns.")

# Drop rows with missing values
df = df.dropna(subset=["text", "label"])
df["text"] = df["text"].astype(str)

print(f"Dataset loaded: {len(df)} samples, {df['label'].nunique()} classes")
print(f"Class distribution:\n{df['label'].value_counts()}\n")

X = df["text"]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = Pipeline([
    ("tfidf", TfidfVectorizer(
        max_features=10000,
        ngram_range=(1, 2),  # unigrams + bigrams for better accuracy
        sublinear_tf=True
    )),
    ("clf", MultinomialNB(alpha=0.1))
])

model.fit(X_train, y_train)

predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)

print(f"Accuracy: {accuracy:.4f} ({accuracy * 100:.2f}%)\n")
print("Classification Report:")
print(classification_report(y_test, predictions))

model_path = "model/form_classifier.pkl"
joblib.dump(model, model_path)
print(f"Model saved to '{model_path}'")
