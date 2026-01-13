param(
  [string]$Branch = $(git branch --show-current)
)

if (-not $Branch) {
  Write-Error "Could not determine branch"
  exit 1
}

Write-Host "🔁 Switching to branch: $Branch"
git checkout $Branch

Write-Host "⬇️ Pulling latest main (rebase)"
git fetch origin
git rebase origin/main
if ($LASTEXITCODE -ne 0) {
  Write-Host "⚠️ Rebase stopped due to conflicts."
  Write-Host "Resolve conflicts, then re-run this script."
  exit 1
}

Write-Host "📦 Staging all changes"
git add -A

$diff = git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host "ℹ️ No changes to commit."
} else {
  Write-Host "📝 Committing"
  git commit -m "chore: resolve conflicts and update"
}

Write-Host "🚀 Pushing branch: $Branch"
git push origin $Branch

Write-Host "✅ Done. Branch is ready to merge."
