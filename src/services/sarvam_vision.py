import base64
import os
import httpx
from typing import Dict, Any, Optional
from src.config import settings


class SarvamVisionService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.sarvam_api_key
        self.endpoint = settings.sarvam_vision_url

    async def extract_ocr(self, image_path: str) -> Dict[str, Any]:
        """
        Sends an invoice image/PDF to Sarvam Vision API for OCR & Layout Parsing.
        Supports 22 Indian languages.
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Invoice file not found: {image_path}")

        # If API key is missing, return a structured fallback response for local offline testing
        if not self.api_key or self.api_key == "your_sarvam_api_key_here":
            return self._mock_offline_ocr(image_path)

        with open(image_path, "rb") as img_file:
            encoded_image = base64.b64encode(img_file.read()).decode("utf-8")

        headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "image": encoded_image,
            "language_code": "hi-IN", # Supports auto-detection or Indic language hints
            "detect_tables": True,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(self.endpoint, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()

    def _mock_offline_ocr(self, image_path: str) -> Dict[str, Any]:
        """
        Fallback method for local development & benchmarking without live API key.
        """
        file_name = os.path.basename(image_path)
        return {
            "status": "success",
            "provider": "Sarvam Vision OCR (Mock Offline Mode)",
            "text": f"MOCK OCR output for {file_name}. Set SARVAM_API_KEY in .env to use live API.",
            "language_detected": "en-IN",
            "tables": [],
            "file_path": image_path,
        }
