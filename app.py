# app.py
# ICY Portfolio — Flask Backend
# Serves static files + handles the contact form
#
# Run:  python app.py
# URL:  http://localhost:5000

import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, render_template, request, jsonify

# ── App setup ──────────────────────────────────────────────
app = Flask(
    __name__,
    static_folder="static",      # CSS / JS / images live here
    template_folder="templates"  # index.html lives here
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Config (edit these or use environment variables) ────────
# It is best practice to store secrets in environment variables
# rather than hard-coding them. See README for details.

MAIL_HOST     = os.environ.get("MAIL_HOST",     "smtp.gmail.com")
MAIL_PORT     = int(os.environ.get("MAIL_PORT", 587))
MAIL_USER     = os.environ.get("MAIL_USER",     "your-email@gmail.com")
MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD", "your-app-password")
MAIL_TO       = os.environ.get("MAIL_TO",       "hello@icy.dev")


# ── Routes ─────────────────────────────────────────────────

@app.route("/")
def index():
    """Serve the portfolio homepage."""
    return render_template("index.html")


@app.route("/contact", methods=["POST"])
def contact():
    """
    Accept JSON from the contact form and:
      1. Validate the fields
      2. (Optionally) send an email
      3. Return a JSON response the frontend can read
    """
    data = request.get_json(silent=True) or {}

    name    = data.get("name",    "").strip()
    email   = data.get("email",   "").strip()
    subject = data.get("subject", "").strip() or "Portfolio Contact"
    message = data.get("message", "").strip()

    # ── Basic validation ──
    errors = []
    if not name:    errors.append("Name is required.")
    if not email:   errors.append("Email is required.")
    if "@" not in email: errors.append("Email looks invalid.")
    if not message: errors.append("Message is required.")

    if errors:
        return jsonify({"ok": False, "errors": errors}), 400

    # ── Try to send email (gracefully skip if not configured) ──
    email_sent = False
    if MAIL_USER != "your-email@gmail.com" and MAIL_PASSWORD != "your-app-password":
        try:
            email_sent = _send_email(name, email, subject, message)
        except Exception as exc:
            logger.error("Email send failed: %s", exc)
    else:
        logger.info("Email not configured — logging submission instead.")
        logger.info("FROM: %s <%s> | SUBJECT: %s | MSG: %s", name, email, subject, message)
        email_sent = True  # treat as success so the form still works while testing

    if email_sent:
        return jsonify({"ok": True,  "message": "Got it! I'll be in touch soon."}), 200
    else:
        return jsonify({"ok": False, "errors": ["Could not send message. Please try again."]}), 500


# ── Email helper ────────────────────────────────────────────

def _send_email(name: str, sender_email: str, subject: str, body: str) -> bool:
    """Send a formatted email via SMTP and return True on success."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"[Portfolio] {subject}"
    msg["From"]    = MAIL_USER
    msg["To"]      = MAIL_TO
    msg["Reply-To"] = sender_email

    # Plain-text fallback
    text = f"Name:    {name}\nEmail:   {sender_email}\n\n{body}"

    # HTML version
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;
                background:#000022;color:#FBF5F3;border-radius:8px;">
      <h2 style="color:#931621;margin-bottom:8px;">New Portfolio Message</h2>
      <p style="color:#aaa;margin-bottom:24px;font-size:13px;">
        Sent via your portfolio contact form
      </p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#888;width:80px;">Name</td>
          <td style="padding:8px 0;">{name}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#888;">Email</td>
          <td style="padding:8px 0;">
            <a href="mailto:{sender_email}" style="color:#931621;">{sender_email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#888;">Subject</td>
          <td style="padding:8px 0;">{subject}</td>
        </tr>
      </table>
      <hr style="border:none;border-top:1px solid #222;margin:20px 0;" />
      <p style="white-space:pre-wrap;line-height:1.7;">{body}</p>
    </div>
    """

    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html,  "html"))

    with smtplib.SMTP(MAIL_HOST, MAIL_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(MAIL_USER, MAIL_PASSWORD)
        server.sendmail(MAIL_USER, MAIL_TO, msg.as_string())

    logger.info("Email sent to %s", MAIL_TO)
    return True


# ── Run ─────────────────────────────────────────────────────
if __name__ == "__main__":
    # debug=True gives live reload; set to False in production
    app.run(debug=True, host="0.0.0.0", port=5000)
