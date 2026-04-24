#!/usr/bin/env powershell
# PowerShell Font Setup Script for Arabic PDF Support
# Windows compatible font installer for DomPDF

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$FontDir = Join-Path $ProjectRoot "storage\fonts"

Write-Host "Setting up Arabic fonts for DomPDF..." -ForegroundColor Cyan
Write-Host "Project root: $ProjectRoot" -ForegroundColor Gray

# Ensure font directory exists
if (-not (Test-Path $FontDir)) {
    New-Item -ItemType Directory -Path $FontDir -Force | Out-Null
    Write-Host "Created font directory: $FontDir" -ForegroundColor Green
}
else {
    Write-Host "Font directory ready: $FontDir" -ForegroundColor Green
}

# Check if fonts already installed
$dejaVuSansPath = Join-Path $FontDir "DejaVuSans.ttf"
$dejaVuBoldPath = Join-Path $FontDir "DejaVuSans-Bold.ttf"

if ((Test-Path $dejaVuSansPath) -and (Test-Path $dejaVuBoldPath)) {
    Write-Host "Fonts already installed" -ForegroundColor Green
    $size1 = [math]::Round((Get-Item $dejaVuSansPath).Length / 1024, 2)
    $size2 = [math]::Round((Get-Item $dejaVuBoldPath).Length / 1024, 2)
    Write-Host "  - DejaVuSans.ttf ($size1 KB)" -ForegroundColor Green
    Write-Host "  - DejaVuSans-Bold.ttf ($size2 KB)" -ForegroundColor Green
    exit 0
}

# Try to copy from Windows System Fonts
Write-Host "Checking system fonts..." -ForegroundColor Yellow

$windowsFontsPath = "C:\Windows\Fonts"
$systemDejaVuSans = Join-Path $windowsFontsPath "DejaVuSans.ttf"
$systemDejaVuBold = Join-Path $windowsFontsPath "DejaVuSans-Bold.ttf"

if ((Test-Path $systemDejaVuSans) -and (Test-Path $systemDejaVuBold)) {
    Write-Host "Found system fonts, copying..." -ForegroundColor Gray
    Copy-Item -Path $systemDejaVuSans -Destination $dejaVuSansPath -Force
    Copy-Item -Path $systemDejaVuBold -Destination $dejaVuBoldPath -Force
    Write-Host "DejaVu Sans fonts installed from system" -ForegroundColor Green
}
else {
    Write-Host "System fonts not found, attempting download..." -ForegroundColor Yellow
    
    $downloadUrl = "https://github.com/google/fonts/raw/main/ofl/cairo/Cairo%5Bwght%5D.ttf"
    $outputPath = Join-Path $FontDir "Cairo.ttf"
    
    try {
        Write-Host "Downloading Cairo font (Arabic optimized)..." -ForegroundColor Gray
        $WebClient = New-Object System.Net.WebClient
        $WebClient.DownloadFile($downloadUrl, $outputPath)
        Write-Host "Cairo font downloaded" -ForegroundColor Green
        Write-Host "For best compatibility, also download DejaVu Sans" -ForegroundColor Yellow
        Write-Host "From: https://sourceforge.net/projects/dejavu/files/" -ForegroundColor Gray
    }
    catch {
        Write-Host "Download failed: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Manual Font Installation Required:" -ForegroundColor Cyan
        Write-Host "1. Download DejaVu Sans from:" -ForegroundColor Gray
        Write-Host "   https://sourceforge.net/projects/dejavu/files/dejavu/2.37/" -ForegroundColor Cyan
        Write-Host "2. Extract to: $FontDir\" -ForegroundColor Gray
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
}
else {
    Write-Host "ERROR: No fonts found in $FontDir" -ForegroundColor Red
    exit 1
}
