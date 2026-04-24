#!/usr/bin/env powershell
# PowerShell Font Setup Script for Arabic PDF Support
# Windows compatible font installer for DomPDF

# Get backend directory (parent of scripts directory)
$ScriptsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptsDir
$FontDir = Join-Path $ProjectRoot "storage\fonts"

Write-Host "Setting up Arabic fonts for DomPDF..." -ForegroundColor Cyan
Write-Host "Backend root: $ProjectRoot" -ForegroundColor Gray
Write-Host "Font directory: $FontDir" -ForegroundColor Gray

# Ensure font directory exists
if (-not (Test-Path $FontDir)) {
    New-Item -ItemType Directory -Path $FontDir -Force | Out-Null
    Write-Host "[OK] Created font directory" -ForegroundColor Green
}
else {
    Write-Host "[OK] Font directory ready" -ForegroundColor Green
}

# Check if fonts already installed
$dejaVuSansPath = Join-Path $FontDir "DejaVuSans.ttf"
$dejaVuBoldPath = Join-Path $FontDir "DejaVuSans-Bold.ttf"

if ((Test-Path $dejaVuSansPath) -and (Test-Path $dejaVuBoldPath)) {
    Write-Host "[OK] Fonts already installed" -ForegroundColor Green
    $size1 = [math]::Round((Get-Item $dejaVuSansPath).Length / 1024 / 1024, 2)
    $size2 = [math]::Round((Get-Item $dejaVuBoldPath).Length / 1024 / 1024, 2)
    Write-Host "  - DejaVuSans.ttf ($size1 MB)" -ForegroundColor Green
    Write-Host "  - DejaVuSans-Bold.ttf ($size2 MB)" -ForegroundColor Green
    exit 0
}

# Try to copy from Windows System Fonts
Write-Host "Checking system fonts..." -ForegroundColor Yellow

$windowsFontsPath = "C:\Windows\Fonts"
$systemDejaVuSans = Join-Path $windowsFontsPath "DejaVuSans.ttf"
$systemDejaVuBold = Join-Path $windowsFontsPath "DejaVuSans-Bold.ttf"

if ((Test-Path $systemDejaVuSans) -and (Test-Path $systemDejaVuBold)) {
    Write-Host "Found system fonts, copying..." -ForegroundColor Gray
    Copy-Item -Path $systemDejaVuSans -Destination $dejaVuSansPath -Force -ErrorAction SilentlyContinue
    Copy-Item -Path $systemDejaVuBold -Destination $dejaVuBoldPath -Force -ErrorAction SilentlyContinue
    
    if ((Test-Path $dejaVuSansPath) -and (Test-Path $dejaVuBoldPath)) {
        Write-Host "[OK] DejaVu Sans fonts installed from system" -ForegroundColor Green
    }
    else {
        Write-Host "[WARN] Copy failed, attempting download..." -ForegroundColor Yellow
    }
}
else {
    Write-Host "System fonts not found, attempting download..." -ForegroundColor Yellow
}

# If still no fonts, try to download Cairo as fallback
if (-not ((Test-Path $dejaVuSansPath) -and (Test-Path $dejaVuBoldPath))) {
    $downloadUrl = "https://github.com/google/fonts/raw/main/ofl/cairo/Cairo%5Bwght%5D.ttf"
    $outputPath = Join-Path $FontDir "Cairo.ttf"
    
    try {
        Write-Host "Downloading Cairo font (Arabic optimized)..." -ForegroundColor Gray
        $WebClient = New-Object System.Net.WebClient
        $WebClient.DownloadFile($downloadUrl, $outputPath)
        Write-Host "[OK] Cairo font downloaded" -ForegroundColor Green
        Write-Host "For best compatibility, also download DejaVu Sans:" -ForegroundColor Yellow
        Write-Host "  https://sourceforge.net/projects/dejavu/files/" -ForegroundColor Gray
    }
    catch {
        Write-Host "[ERROR] Font installation failed" -ForegroundColor Red
        Write-Host "Manual installation required:" -ForegroundColor Cyan
        Write-Host "1. Download from: https://sourceforge.net/projects/dejavu/files/dejavu/2.37/" -ForegroundColor Gray
        Write-Host "2. Extract to: $FontDir\" -ForegroundColor Cyan
        Write-Host "3. Copy these files:" -ForegroundColor Gray
        Write-Host "   - DejaVuSans.ttf" -ForegroundColor Cyan
        Write-Host "   - DejaVuSans-Bold.ttf" -ForegroundColor Cyan
        exit 1
    }
}

# Verify installation
Write-Host ""
Write-Host "Font Installation Summary:" -ForegroundColor Cyan
$fonts = Get-Item -Path (Join-Path $FontDir "*.ttf") -ErrorAction SilentlyContinue

if ($null -ne $fonts) {
    if ($fonts -is [array]) {
        foreach ($font in $fonts) {
            $sizeKB = [math]::Round($font.Length / 1024, 2)
            Write-Host "  [OK] $($font.Name) ($sizeKB KB)" -ForegroundColor Green
        }
    }
    else {
        $sizeKB = [math]::Round($fonts.Length / 1024, 2)
        Write-Host "  [OK] $($fonts.Name) ($sizeKB KB)" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "Fonts ready for DomPDF" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "[ERROR] No fonts found in $FontDir" -ForegroundColor Red
    exit 1
}
