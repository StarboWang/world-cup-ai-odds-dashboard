#!/usr/bin/env bash
set -euo pipefail

repo_name="${1:-world-cup-ai-odds-dashboard}"
visibility="${2:-public}"

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not logged in. Run: gh auth login"
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  gh repo create "$repo_name" "--$visibility" --source=. --remote=origin --push
else
  git push -u origin main
fi

owner="$(gh api user --jq .login)"
echo "Deployment started."
echo "Actions: https://github.com/${owner}/${repo_name}/actions"
echo "Pages:   https://${owner}.github.io/${repo_name}/"
