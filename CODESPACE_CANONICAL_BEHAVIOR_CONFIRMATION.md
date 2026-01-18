# ============================================================

# CODESPACE — CANONICAL BEHAVIOR CONFIRMATION

# ============================================================

# OBSERVATION:

# Clicking the 🌐 globe icon in the VS Code PORTS tab

# opens a URL like:

#

# https://<adjective>-<animal>-<hash>.github.dev/

#

# Example:

# https://zany-space-cod-r4xjxx5rjq5w3xp64.github.dev/

# ------------------------------------------------------------

# THIS IS EXPECTED AND CORRECT

# ------------------------------------------------------------

# That URL:

# ✔ Is securely mapped to port 5173 inside your Codespace

# ✔ Proxies traffic to the running Vite dev server

# ✔ Is unique to THIS Codespace session

# ✔ Is the ONLY supported browser access method

# ✔ Replaces localhost entirely in Codespaces

# ------------------------------------------------------------

# IMPORTANT CLARIFICATION

# ------------------------------------------------------------

# The URL does NOT say "bickford" because:

# - Codespaces generate ephemeral hostnames

# - The hostname represents the Codespace, not the repo name

# - Routing is done internally by GitHub’s proxy

# This does NOT mean:

# ❌ You are in the wrong repo

# ❌ You are in the wrong app

# ❌ Vite is misconfigured

# ------------------------------------------------------------

# WHAT MATTERS

# ------------------------------------------------------------

# If visiting the github.dev URL shows your app:

# ✔ Everything is correct

# ✔ React is running

# ✔ Vite is serving

# ✔ Networking is complete

# ------------------------------------------------------------

# FINAL LOCKED CONCLUSION

# ------------------------------------------------------------

# DO NOT use:

# http://localhost:5173

#

# ALWAYS use:

# The github.dev URL opened by the PORTS tab globe icon

#

# This is the canonical, supported behavior for Codespaces.

# ============================================================
