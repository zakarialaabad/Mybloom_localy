#!/bin/bash
# Quick script to display recommendation count from database
# Usage: bash backend/scripts/check-recommendations.sh

cd "$(dirname "$0")/../.." 

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          CHECKING DATABASE FOR RECOMMENDATIONS               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Run the Laravel Artisan command
php artisan recommendations:count

echo ""
