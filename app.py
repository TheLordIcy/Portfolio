# app.py
# ICY Portfolio — Flask Backend
# Serves static files + handles the contact form
#
# Run:  python app.py
# URL:  http://localhost:5000

# app.py
import os
import json
import logging
import urllib.request
from flask import Flask, render_template, request, jsonify

app = Flask(__name__, static_folder="static", template_folder="templates")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
MAIL_TO        = os.environ.get("MAIL_TO", "hello@icy.dev")
MAIL_FROM      = "onboarding@resend.dev"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/contact", methods=["POST"])
def contact():
    data    = request.get_json(silent=True) or {}
    name    = data.get("name",    "").strip()
    email   = data.get("email",   "").strip()
    subject = data.get("subject", "").strip() or "Portfolio Contact"
    message = data.get("message", "").strip()

    errors = []
    if not name:         errors.append("Name is required.")
    if not email:        errors.append("Email is required.")
    if "@" not in email: errors.append("Email looks invalid.")
    if not message:      errors.append("Message is required.")
    if errors:
        return jsonify({"ok": False, "errors": errors}), 400

    if RESEND_API_KEY:
        payload = json.dumps({
            "from":     MAIL_FROM,
            "to":       [MAIL_TO],
            "reply_to": email,
            "subject":  f"[Portfolio] {subject}",
            "html":     f"<p><b>From:</b> {name} ({email})</p><p>{message}</p>",
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=payload,
            headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(req)
    else:
        logger.info("No API key — %s <%s>: %s", name, email, message)

    return jsonify({"ok": True, "message": "Got it! I'll be in touch soon."}), 200

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)