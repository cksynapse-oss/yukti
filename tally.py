"""
Tally Prime XML voucher generator.
Converts an approved invoice JSON to a TALLYMESSAGE Purchase Voucher XML.
Standard library only — no external deps.
"""

import xml.etree.ElementTree as ET


def invoice_to_tally_xml(invoice: dict) -> str:
    def fmt(value: float) -> str:
        return f"{float(value):.2f}"

    def tally_date(date_str: str) -> str:
        return str(date_str).replace("-", "").replace("/", "")

    vendor_gstin = invoice.get("supplier_gstin") or invoice.get("vendor_gstin") or "27AAAAA0000A1Z5"
    supplier_name = invoice.get("supplier_name") or invoice.get("vendor_name") or f"Vendor {vendor_gstin[:5]}"
    party_name = supplier_name
    voucher_date = tally_date(invoice.get("invoice_date") or "20260715")
    invoice_no = invoice.get("invoice_no") or invoice.get("invoice_number") or "INV-001"
    grand_total = float(invoice.get("grand_total") or invoice.get("total_amount") or invoice.get("total") or 0.0)
    taxable_value = float(invoice.get("taxable_value") or 0.0)
    cgst = float(invoice.get("cgst") or 0.0)
    sgst = float(invoice.get("sgst") or 0.0)
    igst = float(invoice.get("igst") or 0.0)
    ledger_name = invoice.get("suggested_ledger") or "General Purchase Account"
    hsn = str(invoice.get("hsn_code") or "998313")

    root = ET.Element("ENVELOPE")

    header = ET.SubElement(root, "HEADER")
    ET.SubElement(header, "TALLYREQUEST").text = "Import Data"

    body = ET.SubElement(root, "BODY")
    importdata = ET.SubElement(body, "IMPORTDATA")
    requestdesc = ET.SubElement(importdata, "REQUESTDESC")
    ET.SubElement(requestdesc, "REPORTNAME").text = "Vouchers"

    requestdata = ET.SubElement(importdata, "REQUESTDATA")
    tallymessage = ET.SubElement(
        requestdata, "TALLYMESSAGE", {"xmlns:UDF": "TallyUDF"}
    )

    voucher = ET.SubElement(
        tallymessage, "VOUCHER", {"VCHTYPE": "Purchase", "ACTION": "Create"}
    )
    ET.SubElement(voucher, "DATE").text = voucher_date
    ET.SubElement(voucher, "VOUCHERTYPENAME").text = "Purchase"
    ET.SubElement(voucher, "VOUCHERNUMBER").text = invoice_no
    ET.SubElement(voucher, "PARTYLEDGERNAME").text = party_name
    ET.SubElement(voucher, "PERSISTEDVIEW").text = "Invoice Voucher View"

    # Party ledger — credit (negative)
    party_entry = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
    ET.SubElement(party_entry, "LEDGERNAME").text = party_name
    ET.SubElement(party_entry, "ISDEEMEDPOSITIVE").text = "Yes"
    ET.SubElement(party_entry, "AMOUNT").text = f"-{fmt(grand_total)}"

    items = invoice.get("items") or invoice.get("line_items") or []
    if items:
        for item in items:
            item_taxable = float(item.get("taxable_value") or item.get("taxable_amount") or 0)
            gst_rate = float(item.get("gst_rate") or 18.0)
            description = item.get("item_name") or item.get("description") or ledger_name
            item_hsn = str(item.get("hsn_code") or hsn)

            # Expense ledger — debit
            item_entry = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
            ET.SubElement(item_entry, "LEDGERNAME").text = description
            ET.SubElement(item_entry, "ISDEEMEDPOSITIVE").text = "No"
            ET.SubElement(item_entry, "AMOUNT").text = fmt(item_taxable)

            inv_alloc = ET.SubElement(item_entry, "INVENTORYALLOCATIONS.LIST")
            ET.SubElement(inv_alloc, "STOCKITEMNAME").text = description
            ET.SubElement(inv_alloc, "ISDEEMEDPOSITIVE").text = "No"
            ET.SubElement(inv_alloc, "AMOUNT").text = fmt(item_taxable)
            ET.SubElement(inv_alloc, "HSNCODE").text = item_hsn
    else:
        # Default single entry for taxable amount
        item_entry = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
        ET.SubElement(item_entry, "LEDGERNAME").text = ledger_name
        ET.SubElement(item_entry, "ISDEEMEDPOSITIVE").text = "No"
        ET.SubElement(item_entry, "AMOUNT").text = fmt(taxable_value)

        inv_alloc = ET.SubElement(item_entry, "INVENTORYALLOCATIONS.LIST")
        ET.SubElement(inv_alloc, "STOCKITEMNAME").text = ledger_name
        ET.SubElement(inv_alloc, "ISDEEMEDPOSITIVE").text = "No"
        ET.SubElement(inv_alloc, "AMOUNT").text = fmt(taxable_value)
        ET.SubElement(inv_alloc, "HSNCODE").text = hsn

    # Tax ledger entries
    if cgst > 0:
        e = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
        ET.SubElement(e, "LEDGERNAME").text = "Input CGST @9%"
        ET.SubElement(e, "ISDEEMEDPOSITIVE").text = "No"
        ET.SubElement(e, "AMOUNT").text = fmt(cgst)

    if sgst > 0:
        e = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
        ET.SubElement(e, "LEDGERNAME").text = "Input SGST @9%"
        ET.SubElement(e, "ISDEEMEDPOSITIVE").text = "No"
        ET.SubElement(e, "AMOUNT").text = fmt(sgst)

    if igst > 0:
        e = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
        ET.SubElement(e, "LEDGERNAME").text = "Input IGST @18%"
        ET.SubElement(e, "ISDEEMEDPOSITIVE").text = "No"
        ET.SubElement(e, "AMOUNT").text = fmt(igst)

    return ET.tostring(root, encoding="unicode")


def bank_transactions_to_tally_xml(
    transactions: list[dict], bank_ledger_name: str = "HDFC Bank Current Account #9812"
) -> str:
    """
    Converts parsed bank statement transactions into a valid Tally Prime XML envelope.
    Supports Payment, Receipt, and Contra vouchers with BillAllocations (Agst Ref)
    for Rule 37 180-day compliance tracking.
    """
    def fmt(value: float) -> str:
        return f"{float(value):.2f}"

    def tally_date(date_str: str) -> str:
        s = str(date_str).replace("-", "").replace("/", "")
        # If format is DDMMYYYY, convert to YYYYMMDD
        if len(s) == 8 and s[4:8].isdigit() and int(s[4:8]) > 2000:
            return f"{s[4:8]}{s[2:4]}{s[0:2]}"
        return s

    root = ET.Element("ENVELOPE")
    header = ET.SubElement(root, "HEADER")
    ET.SubElement(header, "TALLYREQUEST").text = "Import Data"

    body = ET.SubElement(root, "BODY")
    importdata = ET.SubElement(body, "IMPORTDATA")
    requestdesc = ET.SubElement(importdata, "REQUESTDESC")
    ET.SubElement(requestdesc, "REPORTNAME").text = "Vouchers"

    requestdata = ET.SubElement(importdata, "REQUESTDATA")
    tallymessage = ET.SubElement(requestdata, "TALLYMESSAGE", {"xmlns:UDF": "TallyUDF"})

    for i, txn in enumerate(transactions, start=1):
        vch_type = txn.get("voucher_type") or ("Payment" if txn.get("withdrawal", 0) > 0 else "Receipt")
        raw_amount = float(txn.get("amount") or txn.get("withdrawal") or txn.get("deposit") or 0.0)
        if raw_amount <= 0:
            continue

        vch_date = tally_date(txn.get("date") or "20260715")
        vch_number = str(txn.get("voucher_no") or txn.get("ref_no") or f"BNK/{vch_date}/{i:04d}")
        narration = str(txn.get("narration") or txn.get("description") or f"Bank transaction via Yukti Auto-Sync")
        party_ledger = str(txn.get("suggested_ledger") or txn.get("counterparty") or "General Suspense Account")
        bill_ref = txn.get("bill_ref") or txn.get("matched_invoice_no")

        voucher = ET.SubElement(tallymessage, "VOUCHER", {"VCHTYPE": vch_type, "ACTION": "Create"})
        ET.SubElement(voucher, "DATE").text = vch_date
        ET.SubElement(voucher, "VOUCHERTYPENAME").text = vch_type
        ET.SubElement(voucher, "VOUCHERNUMBER").text = vch_number
        ET.SubElement(voucher, "PARTYLEDGERNAME").text = party_ledger if vch_type != "Contra" else bank_ledger_name
        ET.SubElement(voucher, "NARRATION").text = narration

        if vch_type == "Payment":
            # Party / Expense Debit (Positive in Tally representation)
            debit_entry = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
            ET.SubElement(debit_entry, "LEDGERNAME").text = party_ledger
            ET.SubElement(debit_entry, "ISDEEMEDPOSITIVE").text = "Yes"
            ET.SubElement(debit_entry, "AMOUNT").text = f"-{fmt(raw_amount)}"

            # Rule 37 Statutory Bill Allocation
            if bill_ref:
                bill_alloc = ET.SubElement(debit_entry, "BILLALLOCATIONS.LIST")
                ET.SubElement(bill_alloc, "NAME").text = str(bill_ref)
                ET.SubElement(bill_alloc, "BILLTYPE").text = "Agst Ref"
                ET.SubElement(bill_alloc, "AMOUNT").text = f"-{fmt(raw_amount)}"

            # Bank Credit
            credit_entry = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
            ET.SubElement(credit_entry, "LEDGERNAME").text = bank_ledger_name
            ET.SubElement(credit_entry, "ISDEEMEDPOSITIVE").text = "No"
            ET.SubElement(credit_entry, "AMOUNT").text = fmt(raw_amount)

        elif vch_type == "Receipt":
            # Bank Debit
            debit_entry = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
            ET.SubElement(debit_entry, "LEDGERNAME").text = bank_ledger_name
            ET.SubElement(debit_entry, "ISDEEMEDPOSITIVE").text = "Yes"
            ET.SubElement(debit_entry, "AMOUNT").text = f"-{fmt(raw_amount)}"

            # Party / Income Credit
            credit_entry = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
            ET.SubElement(credit_entry, "LEDGERNAME").text = party_ledger
            ET.SubElement(credit_entry, "ISDEEMEDPOSITIVE").text = "No"
            ET.SubElement(credit_entry, "AMOUNT").text = fmt(raw_amount)

            if bill_ref:
                bill_alloc = ET.SubElement(credit_entry, "BILLALLOCATIONS.LIST")
                ET.SubElement(bill_alloc, "NAME").text = str(bill_ref)
                ET.SubElement(bill_alloc, "BILLTYPE").text = "Agst Ref"
                ET.SubElement(bill_alloc, "AMOUNT").text = fmt(raw_amount)

        elif vch_type == "Contra":
            # If cash withdrawn from bank (withdrawal > 0)
            is_withdrawal = float(txn.get("withdrawal") or 0.0) > 0
            dest_ledger = str(txn.get("suggested_ledger") or "Cash in Hand")

            if is_withdrawal:
                # Cash Debit
                d = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
                ET.SubElement(d, "LEDGERNAME").text = dest_ledger
                ET.SubElement(d, "ISDEEMEDPOSITIVE").text = "Yes"
                ET.SubElement(d, "AMOUNT").text = f"-{fmt(raw_amount)}"

                # Bank Credit
                c = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
                ET.SubElement(c, "LEDGERNAME").text = bank_ledger_name
                ET.SubElement(c, "ISDEEMEDPOSITIVE").text = "No"
                ET.SubElement(c, "AMOUNT").text = fmt(raw_amount)
            else:
                # Cash deposited into bank
                d = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
                ET.SubElement(d, "LEDGERNAME").text = bank_ledger_name
                ET.SubElement(d, "ISDEEMEDPOSITIVE").text = "Yes"
                ET.SubElement(d, "AMOUNT").text = f"-{fmt(raw_amount)}"

                c = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
                ET.SubElement(c, "LEDGERNAME").text = dest_ledger
                ET.SubElement(c, "ISDEEMEDPOSITIVE").text = "No"
                ET.SubElement(c, "AMOUNT").text = fmt(raw_amount)

    return ET.tostring(root, encoding="unicode")

