param(
  [switch]$CheckOnly,
  [switch]$SeedOnly,
  [switch]$NoSeed,
  [string]$RuntimeDir,
  [int]$BackendPort = 8000,
  [int]$FrontendPort = 3000
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "Customer Self-Service Demo Launcher"
Write-Host "Scope: Paper Only, local backend/frontend, local SQLite, no broker, no credentials."

$argsList = @()
if ($CheckOnly) {
  $argsList += "--check-only"
}
if ($SeedOnly) {
  $argsList += "--seed-only"
}
if ($NoSeed) {
  $argsList += "--no-seed"
}
if ($RuntimeDir) {
  $argsList += "--runtime-dir"
  $argsList += $RuntimeDir
}
if ($BackendPort -ne 8000) {
  $argsList += "--backend-port"
  $argsList += [string]$BackendPort
}
if ($FrontendPort -ne 3000) {
  $argsList += "--frontend-port"
  $argsList += [string]$FrontendPort
}

if ($CheckOnly) {
  & bash scripts/check-customer-demo-env.sh
} else {
  & bash scripts/start-customer-demo.sh @argsList
}
