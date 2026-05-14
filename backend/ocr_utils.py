import pytesseract
from PIL import Image
import pdfplumber


def extract_text_from_image(image_path: str) -> str:
    """Extract text from an image file using Tesseract OCR."""
    try:
        image = Image.open(image_path)
        # Convert to RGB if needed (handles RGBA, palette images, etc.)
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        text = pytesseract.image_to_string(image)
        return text.strip()
    except pytesseract.TesseractNotFoundError:
        raise RuntimeError(
            "Tesseract OCR is not installed or not found in PATH. "
            "Install it with: sudo apt-get install tesseract-ocr"
        )
    except Exception as e:
        raise RuntimeError(f"Failed to extract text from image: {str(e)}")


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF file using pdfplumber."""
    try:
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"Failed to extract text from PDF: {str(e)}")
