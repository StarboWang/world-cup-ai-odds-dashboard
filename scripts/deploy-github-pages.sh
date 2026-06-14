#!/usr/bin/env bash
set -euo pipefail

repo_name="${1:-world-cup-ai-odds-dashboard}"
visibility="${2:-public}"

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not logged in. Run: gh auth login"
  exit 1
fi

owner="$(gh api user --jq .login)"
repo="${owner}/${repo_name}"

if ! git remote get-url origin >/dev/null 2>&1; then
  gh repo create "$repo_name" "--$visibility" --source=. --remote=origin --push
else
  git push -u origin HEAD:main
fi

cleanup() {
  if [ -d /tmp/world-cup-api-backup-pages ]; then
    mv /tmp/world-cup-api-backup-pages app/api
  fi
  rm -rf /tmp/world-cup-pages
}
trap cleanup EXIT

rm -rf out /tmp/world-cup-pages /tmp/world-cup-api-backup-pages
if [ -d app/api ]; then
  mv app/api /tmp/world-cup-api-backup-pages
fi

GITHUB_PAGES=true \
GITHUB_REPOSITORY="$repo" \
NEXT_PUBLIC_STATIC_DEMO=true \
npm run build

mkdir /tmp/world-cup-pages
git -C /tmp/world-cup-pages init -b gh-pages
git -C /tmp/world-cup-pages remote add origin "https://github.com/${repo}.git"
rsync -a --delete --exclude ".git" out/ /tmp/world-cup-pages/
git -C /tmp/world-cup-pages add -A
git -C /tmp/world-cup-pages commit -m "Publish static site"
git -C /tmp/world-cup-pages push -u origin gh-pages --force

gh api -X POST "repos/${repo}/pages" -f 'source[branch]=gh-pages' -f 'source[path]=/' >/dev/null 2>&1 || \
  gh api -X PUT "repos/${repo}/pages" -f 'source[branch]=gh-pages' -f 'source[path]=/' >/dev/null

echo "Published."
echo "Repository: https://github.com/${repo}"
echo "Pages:      https://${owner}.github.io/${repo_name}/"
