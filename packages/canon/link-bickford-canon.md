# Bickford Canon Real-Time Sync Setup

This script automates real-time updates of the Bickford Canon package across all your repos using npm link. Any change to the canon source is instantly reflected in all dependent projects.

## Usage

1. Edit the `REPO_PATHS` array in link-bickford-canon.sh to include absolute paths to all your dependent repos.
2. Run the script from the canon repo root:

   bash ./link-bickford-canon.sh

3. To unlink (restore normal npm behavior), run:

   bash ./link-bickford-canon.sh unlink

---

- All code changes to canon are instantly available in all linked repos.
- For production, publish a versioned package as usual.
