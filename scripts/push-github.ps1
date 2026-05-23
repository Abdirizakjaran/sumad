# Run after installing Git: https://git-scm.com/download/win
param(
  [Parameter(Mandatory = $true)]
  [string]$GitHubUsername
)

$repo = "sumad-traffic-mgt"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Set-Location $root

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Git not found. Install from https://git-scm.com/download/win and restart terminal."
  exit 1
}

if (-not (Test-Path ".git")) {
  git init
  git branch -M main
}

git add .
git commit -m "SUMAD TRAFFIC MGT - production ready" 2>$null

$remote = "https://github.com/$GitHubUsername/$repo.git"
git remote remove origin 2>$null
git remote add origin $remote

Write-Host "Pushing to $remote ..."
git push -u origin main

Write-Host ""
Write-Host "Done! Repo: https://github.com/$GitHubUsername/$repo"
Write-Host "Next: Deploy API on Render, then client on Vercel (see DEPLOY.md)"
