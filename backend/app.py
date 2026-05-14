from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os

from form_detector import detect_form_type
from ocr_utils import extract_text_from_image, extract_text_from_pdf

app = FastAPI(title="AI Form Type Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


class TextInput(BaseModel):
    text: str


@app.get("/")
def home():
    return {"message": "AI Form Type Detector API", "status": "running"}


@app.post("/detect-text")
async def detect_text(data: TextInput):
    text = data.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    try:
        result = detect_form_type(text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")


@app.post("/detect-file")
async def detect_file(file: UploadFile = File(...)):
    allowed_extensions = (".png", ".jpg", ".jpeg", ".pdf")
    filename = file.filename or ""

    if not filename.lower().endswith(allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload PNG, JPG, JPEG, or PDF."
        )

    file_path = os.path.join(UPLOAD_FOLDER, filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = ""

        if filename.lower().endswith((".png", ".jpg", ".jpeg")):
            extracted_text = extract_text_from_image(file_path)
        elif filename.lower().endswith(".pdf"):
            extracted_text = extract_text_from_pdf(file_path)

        if not extracted_text.strip():
            raise HTTPException(
                status_code=422,
                detail="No text could be extracted from the file."
            )

        result = detect_form_type(extracted_text)

        return {
            "extracted_text": extracted_text,
            "prediction": result
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")
    finally:
        # Clean up uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)
