#!/bin/bash
set -euo pipefail

APP_ROOT="/var/www/mybloom/Mybloom"
BACKEND_DIR="$APP_ROOT/backend"
FRONTEND_DIR="$APP_ROOT/frontend"

echo "=== Preparing current checkout ==="
cd "$APP_ROOT"
sudo chown -R root:root "$BACKEND_DIR"
echo "Deploying local working tree from $APP_ROOT"

echo "=== Fixing DB config ==="
sudo sed -i 's|DB_DATABASE=parfum|DB_DATABASE=mybloom|' "$BACKEND_DIR/.env"
sudo sed -i 's|DB_USERNAME=root|DB_USERNAME=loubna|' "$BACKEND_DIR/.env"

echo "=== Fixing permissions ==="
sudo chown -R www-data:www-data "$BACKEND_DIR/storage"
sudo chmod -R 775 "$BACKEND_DIR/storage"
sudo mkdir -p "$BACKEND_DIR/storage/framework/cache/data"
sudo chown -R www-data:www-data "$BACKEND_DIR/bootstrap/cache"
sudo chmod -R 775 "$BACKEND_DIR/bootstrap/cache"

echo "=== Laravel cache ==="
cd "$BACKEND_DIR"
php artisan config:cache
php artisan route:cache

echo "=== Fixing frontend files ==="
sudo python3 -c "
f=open('$FRONTEND_DIR/.env.local','w')
f.write('NEXT_PUBLIC_API_URL=https://mybloom.ma/api\nNEXT_PUBLIC_API_HOST=mybloom.ma\nNEXT_PUBLIC_APP_NAME=Mybloom\nNEXT_PUBLIC_TOKEN_COOKIE=mybloom_token\nNEXT_PUBLIC_SITE_URL=https://mybloom.ma\n')
f.close()
"

grep -q "missingSuspenseWithCSRBailout" "$FRONTEND_DIR/next.config.mjs" || \
  sed -i "s/const nextConfig = {/const nextConfig = {\n  experimental: { missingSuspenseWithCSRBailout: false },/" "$FRONTEND_DIR/next.config.mjs"

python3 -c "
f=open('$FRONTEND_DIR/components/sections/HeroSection.tsx','rb')
c=f.read(); f.close()
c=c.replace(b'/api/hero-videos',b'/api/v1/videos/hero')
f=open('$FRONTEND_DIR/components/sections/HeroSection.tsx','wb')
f.write(c); f.close()
"

python3 -c "
f=open('$FRONTEND_DIR/components/layout/Header.tsx','rb')
c=f.read(); f.close()
c=c.replace(b\"label: 'BEURRE',              href: '/collection?cat=beurre'\", b\"label: 'BEURRE CORPOREL',     href: '/collection?cat=beurre-corporel'\")
f=open('$FRONTEND_DIR/components/layout/Header.tsx','wb')
f.write(c); f.close()
"

echo "=== Building frontend ==="
cd "$FRONTEND_DIR"
rm -rf .next/standalone/public
npm run build
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
cp -r node_modules/sharp .next/standalone/node_modules/ 2>/dev/null || true
pm2 restart mybloom-frontend

echo "=== Done! ==="

echo "=== Fixing storage permissions ==="
sudo chown -R www-data:www-data "$BACKEND_DIR/storage/app/public"
sudo chmod -R 775 "$BACKEND_DIR/storage/app/public"
sudo mkdir -p "$BACKEND_DIR/storage/framework/cache/data"
sudo chown -R www-data:www-data "$BACKEND_DIR/storage/framework"
sudo chmod -R 775 "$BACKEND_DIR/storage/framework"
