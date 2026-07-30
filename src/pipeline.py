import time
from typing import Optional
from src.schemas.invoice import InvoicePipelineResult
from src.services.sarvam_vision import SarvamVisionService
from src.services.sarvam_llm import SarvamLLMService
from src.services.validator import run_deterministic_validation


class DocumentPipeline:
    def __init__(
        self,
        vision_service: Optional[SarvamVisionService] = None,
        llm_service: Optional[SarvamLLMService] = None,
    ):
        self.vision_service = vision_service or SarvamVisionService()
        self.llm_service = llm_service or SarvamLLMService()

    async def process_invoice(self, image_path: str) -> InvoicePipelineResult:
        """
        Executes the full 6-stage document intelligence pipeline on an invoice document.
        """
        start_time = time.time()

        # Stage 1: Normalize (Handled inside vision service load)
        # Stage 2: Classify (Auto-classified as invoice)

        # Stage 3: OCR via Sarvam Vision API
        ocr_result = await self.vision_service.extract_ocr(image_path)
        ocr_text = ocr_result.get("text", "")

        # Stage 4: Field Extraction via Sarvam 30B LLM
        extraction = await self.llm_service.extract_structured_invoice(ocr_text)

        # Stage 5: Deterministic Validation Checks
        checks, confidence_score, routing_decision = run_deterministic_validation(extraction)

        # Stage 6: Ledger Suggestion & Routing
        suggested_ledger = self._suggest_tally_ledger(extraction)

        elapsed_seconds = round(time.time() - start_time, 3)

        return InvoicePipelineResult(
            extraction=extraction,
            validation_checks=checks,
            composite_confidence_score=confidence_score,
            routing_decision=routing_decision,
            suggested_tally_ledger=suggested_ledger,
            processing_time_seconds=elapsed_seconds,
        )

    def _suggest_tally_ledger(self, extraction) -> str:
        """
        Basic ledger mapper rule engine.
        In production, this queries the firm's vendor_patterns table.
        """
        if extraction.supplier_name:
            return f"Purchase Account - {extraction.supplier_name.strip()}"
        return "General Purchase Account"
