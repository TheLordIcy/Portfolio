# ICY Portfolio — Flask Backend

Serves your existing `index.html` / `style.css` / `script.js` files
and handles the contact form with real email support.

---

## Folder layout

```
icy-backend/
├── app.py              ← Flask app (routes + email logic)
├── requirements.txt    ← Python dependencies
├── contact_form.js     ← Drop-in JS to replace the mock form submit
├── templates/
│   └── index.html      ← ✅ PUT YOUR index.html HERE
└── static/
    ├── style.css        ← ✅ PUT YOUR style.css HERE
    └── script.js        ← ✅ PUT YOUR script.js HERE (after editing it)
```

---

## Step 1 — Move your files

```
index.html  →  templates/index.html
style.css   →  static/style.css
script.js   →  static/script.js
```

---

## Step 2 — Update index.html paths

Flask's `url_for` helper generates correct static URLs.
Open `templates/index.html` and change the two tags in `<head>` / bottom:

```html
<!-- BEFORE -->
<link rel="stylesheet" href="style.css" />
...
<script src="script.js"></script>

<!-- AFTER -->
<link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}" />
...
<script src="{{ url_for('static', filename='script.js') }}"></script>
```

---

## Step 3 — Update the contact form JS

Open `static/script.js` and **replace** the entire
`form.addEventListener('submit', ...)` block with the code
from `contact_form.js` (provided in this folder).

---

## Step 4 — Install Python & Flask

You need **Python 3.8+** installed. Then:

```bash
# Create a virtual environment (keeps things tidy)
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac / Linux:
source venv/bin/activate

# Install Flask
pip install -r requirements.txt
```

---

## Step 5 — Run the server

```bash
python app.py
```

Open your browser at → **http://localhost:5000**

Your portfolio will load and the contact form will POST to `/contact`.

---

## Step 6 (Optional) — Enable real emails

The form works without email configured (submissions are logged to the
terminal). To actually receive emails:

### Gmail setup
1. Go to your Google Account → Security → **2-Step Verification** (enable it)
2. Then go to → **App Passwords** → create one for "Mail"
3. Copy the 16-character password

### Set environment variables (recommended — never hard-code secrets)

**Mac / Linux:**
```bash
export MAIL_USER="you@gmail.com"
export MAIL_PASSWORD="abcd efgh ijkl mnop"   # the App Password
export MAIL_TO="hello@icy.dev"
python app.py
```

**Windows (Command Prompt):**
```cmd
set MAIL_USER=you@gmail.com
set MAIL_PASSWORD=abcd efgh ijkl mnop
set MAIL_TO=hello@icy.dev
python app.py
```

**Windows (PowerShell):**
```powershell
$env:MAIL_USER="you@gmail.com"
$env:MAIL_PASSWORD="abcd efgh ijkl mnop"
$env:MAIL_TO="hello@icy.dev"
python app.py
```

---

## Going live (deploy)

| Platform  | How |
|-----------|-----|
| **Railway** | Push folder to GitHub → connect repo → set env vars in dashboard |
| **Render**  | Same — free tier available, auto-deploys from GitHub |
| **Fly.io**  | `fly launch` then `fly deploy` |
| **VPS**     | Install gunicorn: `pip install gunicorn` then `gunicorn app:app` |

For any platform, set `MAIL_USER`, `MAIL_PASSWORD`, and `MAIL_TO`
as environment variables in the dashboard — never commit them to Git.

---

## Quick test (no browser)

```bash
# With the server running, in another terminal:
curl -X POST http://localhost:5000/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com","message":"Hello!"}'

# Expected response:
# {"ok": true, "message": "Got it! I'll be in touch soon."}
```
