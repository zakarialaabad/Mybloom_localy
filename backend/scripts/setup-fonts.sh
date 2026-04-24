#!/bin/bash
# Font Setup Script for Arabic PDF Support
# Automatically downloads DejaVuSans font with Arabic support

set -e

FONT_DIR="storage/fonts"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔤 Setting up Arabic fonts for DomPDF..."
echo "   Project root: $PROJECT_ROOT"

# Ensure font directory exists
mkdir -p "$FONT_DIR"
echo "✓ Font directory ready: $FONT_DIR"

# Check if fonts already exist
if [ -f "$FONT_DIR/DejaVuSans.ttf" ] && [ -f "$FONT_DIR/DejaVuSans-Bold.ttf" ]; then
    echo "✓ Fonts already installed"
else
    echo "📥 Downloading DejaVuSans fonts..."
    
    # Try to download from Google Fonts (DejaVu Sans Alternative)
    # Using a direct link to the font files
    if command -v curl &> /dev/null; then
        # Download from Ubuntu font repository (reliable source)
        cd "$FONT_DIR"
        
        echo "  Downloading DejaVuSans.ttf..."
        curl -L -o DejaVuSans.ttf \
            "http://sourceforge.net/projects/dejavu/files/dejavu/2.37/dejavu-fonts-ttf-2.37.tar.bz2/download" \
            -o dejavu-fonts.tar.bz2 2>/dev/null || {
            echo "  Alternative download method..."
            # Fallback: Use apt package if available
            if command -v apt-get &> /dev/null; then
                apt-get update && apt-get install -y fonts-dejavu
                cp /usr/share/fonts/truetype/dejavu/DejaVuSans.ttf .
                cp /usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf .
            else
                echo "⚠️  Could not auto-download fonts"
                echo "📋 Manual installation instructions:"
                echo "   1. Download from: https://sourceforge.net/projects/dejavu/files/"
                echo "   2. Extract DejaVuSans.ttf and DejaVuSans-Bold.ttf"
                echo "   3. Place in: $PROJECT_ROOT/$FONT_DIR/"
                exit 1
            fi
        }
        
        cd "$PROJECT_ROOT"
    else
        echo "⚠️  curl not found. Please download manually:"
        echo "   https://sourceforge.net/projects/dejavu/files/dejavu/2.37/"
        exit 1
    fi
    
    echo "✓ DejaVu Sans fonts downloaded"
fi

# Verify fonts exist
if [ -f "$FONT_DIR/DejaVuSans.ttf" ]; then
    echo "✅ All fonts ready for DomPDF"
    ls -lh "$FONT_DIR"/*.ttf
else
    echo "❌ Font installation failed"
    exit 1
fi
