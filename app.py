from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from form_detector import detect_form_type
from ocr_utils import extract_text_from_image, extract_text_from_pdf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.get("/")
def home():
    return {"message": "AI Form Type Detector API"}

@app.post("/detect-text")
async def detect_text(data: dict):
    text = data.get("text", "")

    result = detect_form_type(text)

    return result

@app.post("/detect-file")
async def detect_file(file: UploadFile = File(...)):

    file_path = f"{UPLOAD_FOLDER}/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = ""

    if file.filename.endswith((".png", ".jpg", ".jpeg")):
        extracted_text = extract_text_from_image(file_path)

    elif file.filename.endswith(".pdf"):
        extracted_text = extract_text_from_pdf(file_path)

    else:
        return {"error": "Unsupported file format"}

    result = detect_form_type(extracted_text)

    return {
        "extracted_text": extracted_text,
        "prediction": result
    }
