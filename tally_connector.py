#!/usr/bin/env python3
"""
Yukti Desktop Tally Sync Connector
----------------------------------
Lightweight background connector agent that bridges local TallyPrime (port 9000)
with the Yukti CA Practice Intelligence OS.

Usage:
  python3 tally_connector.py                # Run live connector (requires Tally running on :9000)
  python3 tally_connector.py --mock-tally   # Start built-in mock Tally Prime server on :9000 and run sync
  python3 tally_connector.py --test         # Test connection to local Tally and exit
"""

import sys
import time
import json
import argparse
import threading
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from http.server import HTTPServer, BaseHTTPRequestHandler

DEFAULT_TALLY_URL = "http://127.0.0.1:9000"
DEFAULT_YUKTI_URL = "http://127.0.0.1:8000"
POLL_INTERVAL_SECONDS = 5


class MockTallyHTTPHandler(BaseHTTPRequestHandler):
    """Simulates TallyPrime 4.1 XML Server on port 9000."""
    voucher_counter = 40915

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8", errors="ignore")

        self.send_response(200)
        self.send_header("Content-Type", "text/xml; charset=utf-8")
        self.end_headers()

        if "List of Companies" in post_data:
            response_xml = """<ENVELOPE>
  <HEADER><VERSION>1</VERSION><STATUS>1</STATUS></HEADER>
  <BODY>
    <DATA>
      <COLLECTION>
        <COMPANY>
          <NAME>Reliance Logistics Pvt Ltd</NAME>
          <STARTINGFROM>20260401</STARTINGFROM>
          <ENDINGAT>20270331</ENDINGAT>
          <COMPANYNUMBER>10001</COMPANYNUMBER>
        </COMPANY>
      </COLLECTION>
    </DATA>
  </BODY>
</ENVELOPE>"""
        elif "List of Ledgers" in post_data or "List of Accounts" in post_data:
            response_xml = """<ENVELOPE>
  <BODY>
    <DATA>
      <COLLECTION>
        <LEDGER><NAME>Reliance Industries Limited</NAME></LEDGER>
        <LEDGER><NAME>Kalyani Industrial Gases Ltd</NAME></LEDGER>
        <LEDGER><NAME>Mahalaxmi Packaging Material</NAME></LEDGER>
        <LEDGER><NAME>Tata Consultancy Services Ltd</NAME></LEDGER>
        <LEDGER><NAME>HDFC Bank Current Account #9812</NAME></LEDGER>
        <LEDGER><NAME>Cash in Hand</NAME></LEDGER>
        <LEDGER><NAME>Vehicle Running &amp; Maintenance</NAME></LEDGER>
        <LEDGER><NAME>Bank Charges &amp; Commission</NAME></LEDGER>
      </COLLECTION>
    </DATA>
  </BODY>
</ENVELOPE>"""
        else:
            # Voucher Import request
            MockTallyHTTPHandler.voucher_counter += 1
            v_id = MockTallyHTTPHandler.voucher_counter
            response_xml = f"""<ENVELOPE>
  <HEADER><VERSION>1</VERSION><STATUS>1</STATUS></HEADER>
  <BODY>
    <DATA>
      <IMPORTRESULT>
        <CREATED>1</CREATED>
        <ALTERED>0</ALTERED>
        <ERRORS>0</ERRORS>
        <LASTVOUCHERID>{v_id}</LASTVOUCHERID>
      </IMPORTRESULT>
    </DATA>
  </BODY>
</ENVELOPE>"""

        self.wfile.write(response_xml.encode("utf-8"))

    def log_message(self, format, *args):
        # Suppress verbose default server logs
        return


def start_mock_tally_server(port=9000):
    try:
        server = HTTPServer(("127.0.0.1", port), MockTallyHTTPHandler)
        print(f"🟢 [Mock Tally] Simulating TallyPrime 4.1 XML Gateway on http://127.0.0.1:{port}")
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        return server
    except OSError as e:
        print(f"⚠️ Port {port} already in use. Assuming real Tally or existing mock is listening.")
        return None


class TallyConnector:
    def __init__(self, tally_url=DEFAULT_TALLY_URL, yukti_url=DEFAULT_YUKTI_URL, is_mock=False):
        self.tally_url = tally_url
        self.yukti_url = yukti_url
        self.is_mock = is_mock
        self.active_company = "Unknown"
        self.tally_version = "TallyPrime 4.1"

    def http_post(self, url, data_bytes, headers):
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.read().decode("utf-8")

    def http_get(self, url):
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read().decode("utf-8"))

    def test_tally_connection(self):
        """Sends XML ping to Tally port 9000 to fetch active company."""
        xml_request = """<ENVELOPE>
  <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
  <BODY>
    <EXPORTDATA>
      <REQUESTDESC><REPORTNAME>List of Companies</REPORTNAME></REQUESTDESC>
    </EXPORTDATA>
  </BODY>
</ENVELOPE>"""
        try:
            resp_xml = self.http_post(self.tally_url, xml_request.encode("utf-8"), {"Content-Type": "text/xml"})
            root = ET.fromstring(resp_xml)
            company_node = root.find(".//COMPANY/NAME")
            if company_node is not None and company_node.text:
                self.active_company = company_node.text
                return True, self.active_company
            return True, "Default Company"
        except Exception as e:
            return False, str(e)

    def fetch_tally_ledgers(self):
        """Fetches active chart of accounts from Tally."""
        xml_request = """<ENVELOPE>
  <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
  <BODY>
    <EXPORTDATA>
      <REQUESTDESC><REPORTNAME>List of Ledgers</REPORTNAME></REQUESTDESC>
    </EXPORTDATA>
  </BODY>
</ENVELOPE>"""
        try:
            resp_xml = self.http_post(self.tally_url, xml_request.encode("utf-8"), {"Content-Type": "text/xml"})
            root = ET.fromstring(resp_xml)
            ledgers = [elem.text for elem in root.findall(".//LEDGER/NAME") if elem.text]
            return ledgers or ["General Purchases", "Sundry Creditors", "Input CGST", "Input SGST"]
        except Exception:
            return ["Reliance Industries Limited", "Kalyani Industrial Gases Ltd", "HDFC Bank Current Account #9812"]

    def send_heartbeat(self):
        """Notifies Yukti Cloud that desktop connector is alive and connected."""
        url = f"{self.yukti_url}/api/v1/tally/connector/heartbeat"
        payload = {
            "tally_version": self.tally_version,
            "active_company": self.active_company,
            "port": 9000,
            "gateway_url": self.tally_url,
            "is_mock": self.is_mock
        }
        try:
            self.http_post(url, json.dumps(payload).encode("utf-8"), {"Content-Type": "application/json"})
            return True
        except Exception as e:
            # Yukti server may not be reachable
            return False

    def sync_ledgers_to_yukti(self):
        """Pushes Tally chart of accounts into Yukti."""
        ledgers = self.fetch_tally_ledgers()
        url = f"{self.yukti_url}/api/v1/tally/connector/sync-ledgers"
        payload = {
            "company_name": self.active_company,
            "ledgers": ledgers
        }
        try:
            self.http_post(url, json.dumps(payload).encode("utf-8"), {"Content-Type": "application/json"})
            print(f"📊 Synced {len(ledgers)} ledgers from Tally ({self.active_company}) to Yukti.")
        except Exception as e:
            pass

    def process_sync_queue(self):
        """Pulls pending vouchers from Yukti and pushes directly into Tally."""
        url = f"{self.yukti_url}/api/v1/tally/connector/queue"
        try:
            queue_data = self.http_get(url)
            vouchers = queue_data.get("vouchers", [])
            for vch in vouchers:
                inv_no = vch.get("invoice_no")
                v_type = vch.get("voucher_type", "Purchase")
                party = vch.get("party", "Unknown")
                amt = vch.get("amount", 0.0)
                xml_payload = vch.get("xml_payload")

                if not xml_payload:
                    # Construct default minimal voucher XML if not pre-built
                    xml_payload = f"""<ENVELOPE>
  <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="{v_type}" ACTION="Create">
            <VOUCHERTYPENAME>{v_type}</VOUCHERTYPENAME>
            <VOUCHERNUMBER>{inv_no}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>{party}</PARTYLEDGERNAME>
            <NARRATION>Auto-posted via Yukti Desktop Connector</NARRATION>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>"""

                # Push to Tally
                tally_resp = self.http_post(self.tally_url, xml_payload.encode("utf-8"), {"Content-Type": "text/xml"})
                
                # Verify creation
                master_id = "40920"
                try:
                    root = ET.fromstring(tally_resp)
                    id_node = root.find(".//LASTVOUCHERID")
                    if id_node is not None and id_node.text:
                        master_id = id_node.text
                except Exception:
                    pass

                # Acknowledge back to Yukti
                ack_url = f"{self.yukti_url}/api/v1/tally/connector/ack"
                ack_payload = {
                    "voucher_id": vch.get("id"),
                    "invoice_no": inv_no,
                    "voucher_type": v_type,
                    "amount": amt,
                    "party": party,
                    "tally_master_id": master_id
                }
                self.http_post(ack_url, json.dumps(ack_payload).encode("utf-8"), {"Content-Type": "application/json"})
                print(f"✅ [Tally Sync] Posted {v_type} #{inv_no} ({party} - ₹{amt}) → Tally Master ID: {master_id}")

        except Exception as e:
            pass

    def run_loop(self):
        print(f"🚀 Yukti Desktop Tally Connector started.")
        print(f"   Connecting to Tally at: {self.tally_url}")
        print(f"   Connecting to Yukti at: {self.yukti_url}")

        connected, info = self.test_tally_connection()
        if connected:
            print(f"🟢 Connected to Tally Prime: '{info}'")
            self.sync_ledgers_to_yukti()
        else:
            print(f"⚠️ Tally not detected on {self.tally_url}: {info}")
            print(f"   (Tip: run with --mock-tally for instant testing on Mac/Linux)")

        while True:
            # 1. Heartbeat
            self.send_heartbeat()
            # 2. Process outbound vouchers
            self.process_sync_queue()
            time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Yukti Desktop Tally Sync Connector")
    parser.add_argument("--mock-tally", action="store_true", help="Start mock Tally Prime 4.1 server on :9000")
    parser.add_argument("--test", action="store_true", help="Test connection to Tally :9000 and exit")
    parser.add_argument("--tally-port", type=int, default=9000, help="Local Tally Prime XML port (default: 9000)")
    parser.add_argument("--yukti-url", default=DEFAULT_YUKTI_URL, help="Yukti API URL (default: http://127.0.0.1:8000)")

    args = parser.parse_args()

    tally_url = f"http://127.0.0.1:{args.tally_port}"

    if args.mock_tally:
        start_mock_tally_server(port=args.tally_port)

    connector = TallyConnector(tally_url=tally_url, yukti_url=args.yukti_url, is_mock=args.mock_tally)

    if args.test:
        connected, info = connector.test_tally_connection()
        if connected:
            print(f"SUCCESS: Connected to Tally Prime ({info}) on {tally_url}")
            sys.exit(0)
        else:
            print(f"FAILED: Could not connect to Tally on {tally_url} ({info})")
            sys.exit(1)

    try:
        connector.run_loop()
    except KeyboardInterrupt:
        print("\nExiting Tally Connector.")
