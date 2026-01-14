# GitHub Codespaces – Bickford Acquisition Automation

This repository is Codespaces-ready.

## How to Launch

1. Open the repo on GitHub
2. Click **Code → Codespaces → Create Codespace**
3. Wait ~60 seconds
4. Run:

```bash
npm run start
npm run tick
npm run status
```

## Environment Variables

Create a `.env` file inside the Codespace:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SENDER_NAME="Derek Bickford"
SENDER_EMAIL=derek@bickford.tech
```

⚠️ **Do NOT commit `.env`**
