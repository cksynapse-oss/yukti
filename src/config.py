import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class Settings:
    sarvam_api_key: str = os.getenv("SARVAM_API_KEY", "")
    sarvam_vision_url: str = os.getenv("SARVAM_VISION_URL", "https://api.sarvam.ai/v1/vision/ocr")
    sarvam_llm_url: str = os.getenv("SARVAM_LLM_URL", "https://api.sarvam.ai/v1/chat/completions")
    
    # Confidence routing thresholds
    auto_post_threshold: float = float(os.getenv("AUTO_POST_CONFIDENCE_THRESHOLD", "90.0"))
    flagged_threshold: float = float(os.getenv("FLAGGED_POST_CONFIDENCE_THRESHOLD", "75.0"))

settings = Settings()
