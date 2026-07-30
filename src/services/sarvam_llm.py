import json
import httpx
from typing import Dict, Any, Optional
from src.config import settings
from src.schemas.invoice import InvoiceExtraction, SupplyType, InvoiceLineItem

SARVAM_SYSTEM_PROMPT = """You are an expert Indian GST tax intelligence AI. Your task is to extract structured JSON from OCR text of Indian invoices.

Extract the following fields in valid JSON matching this schema:
{
  "supplier_name": string,
  "supplier_gstin": string or null,
  "supplier_address": string or null,
  "customer_name": string or null,
  "customer_gstin": string or null,
  "invoice_number": string,
  "invoice_date": "YYYY-MM-DD" or "DD/MM/YYYY" or null,
  "place_of_supply": string or null,
  "supply_type": "INTRASTATE" or "INTERSTATE" or "EXPORT" or "UNKNOWN",
  "is_reverse_charge": boolean,
  "line_items": [
    {
      "item_number": integer,
      "description": string,
      "hsn_sac": string or null,
      "quantity": float or null,
      "unit_price": float or null,
      "discount": float,
      "taxable_value": float,
      "gst_rate": float or null,
      "cgst_amount": float,
      "sgst_amount": float,
      "igst_amount": float,
      "total_amount": float
    }
  ],
  "total_taxable_value": float,
  "total_cgst": float,
  "total_sgst": float,
  "total_igst": float,
  "total_tax_amount": float,
  "round_off": float,
  "grand_total": float
}

Rules:
1. GSTIN must be 15 characters long (e.g. 27AAAAA0000A1Z5).
2. If CGST & SGST exist, supply_type is "INTRASTATE". If IGST exists, supply_type is "INTERSTATE".
3. Return ONLY valid JSON. Do not include markdown code blocks or conversational text.
"""

class SarvamLLMService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.sarvam_api_key
        self.endpoint = settings.sarvam_llm_url

    async def extract_structured_invoice(self, ocr_text: str) -> InvoiceExtraction:
        """
        Sends OCR text to Sarvam 30B / LLM endpoint and parses result into InvoiceExtraction schema.
        """
        if not self.api_key or self.api_key == "your_sarvam_api_key_here":
            return self._mock_extraction_from_text(ocr_text)

        headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "model": "sarvam-30b",
            "messages": [
                {"role": "system", "content": SARVAM_SYSTEM_PROMPT},
                {"role": "user", "content": f"Extract invoice fields from this OCR text:\n\n{ocr_text}"}
            ],
            "temperature": 0.1,
            "max_tokens": 1500,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(self.endpoint, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            raw_json_str = data["choices"][0]["message"]["content"]
            
            # Clean possible markdown formatting
            cleaned_str = raw_json_str.strip().removeprefix("```json").removesuffix("```").strip()
            parsed_dict = json.loads(cleaned_str)
            return InvoiceExtraction(**parsed_dict)

    def _mock_extraction_from_text(self, ocr_text: str) -> InvoiceExtraction:
        """
        Generates a realistic mock extraction for testing the pipeline offline.
        """
        return InvoiceExtraction(
            supplier_name="Reliance Industries Limited",
            supplier_gstin="27AAACR5055K1Z2",
            supplier_address="Maker Chambers IV, Nariman Point, Mumbai, Maharashtra 400021",
            customer_name="Rajnish & Associates CA Firm",
            customer_gstin="27AAAFR1234A1Z0",
            invoice_number="RIL/2026/0892",
            invoice_date="2026-07-15",
            place_of_supply="Maharashtra (27)",
            supply_type=SupplyType.INTRASTATE,
            is_reverse_charge=False,
            line_items=[
                InvoiceLineItem(
                    item_number=1,
                    description="IT Cloud Consulting & Network Services",
                    hsn_sac="998313",
                    quantity=1.0,
                    unit_price=20000.0,
                    taxable_value=20000.0,
                    gst_rate=18.0,
                    cgst_amount=1800.0,
                    sgst_amount=1800.0,
                    igst_amount=0.0,
                    total_amount=23600.0,
                )
            ],
            total_taxable_value=20000.0,
            total_cgst=1800.0,
            total_sgst=1800.0,
            total_igst=0.0,
            total_tax_amount=3600.0,
            round_off=0.0,
            grand_total=23600.0,
        )
