from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path == "/health":
            return self._send_json(200, {"status": "ok"})
        if self.path == "/pricing/evaluate":
            return self._send_json(
                200,
                {
                    "discountLineItems": [],
                    "grandTotal": 0,
                    "messages": ["Pricing stub running"],
                },
            )
        return self._send_json(404, {"error": "not found"})


def main() -> None:
    port = int(os.getenv("PORT", "8000"))
    server = HTTPServer(("", port), Handler)
    server.serve_forever()


if __name__ == "__main__":
    main()
