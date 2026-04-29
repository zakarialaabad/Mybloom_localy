#!/bin/bash
echo "=== Pulling latest code ==="
cd /var/www/mybloom
sudo chown -R Mybloom:Mybloom /var/www/mybloom/backend
git stash
git pull origin main

echo "=== Fixing DB config ==="
sudo sed -i 's|DB_DATABASE=parfum|DB_DATABASE=mybloom|' /var/www/mybloom/backend/.env
sudo sed -i 's|DB_USERNAME=root|DB_USERNAME=loubna|' /var/www/mybloom/backend/.env

echo "=== Fixing permissions ==="
sudo chown -R www-data:www-data /var/www/mybloom/backend/storage
sudo chmod -R 775 /var/www/mybloom/backend/storage
sudo mkdir -p /var/www/mybloom/backend/storage/framework/cache/data
sudo chown -R Mybloom:www-data /var/www/mybloom/backend/bootstrap/cache
sudo chmod -R 775 /var/www/mybloom/backend/bootstrap/cache

echo "=== Laravel cache ==="
cd /var/www/mybloom/backend
php artisan config:cache
php artisan route:cache

echo "=== Fixing frontend files ==="
sudo python3 -c "
f=open('/var/www/mybloom/frontend/.env.local','w')
f.write('NEXT_PUBLIC_API_URL=https://mybloom.ma/api\nNEXT_PUBLIC_API_HOST=mybloom.ma\nNEXT_PUBLIC_APP_NAME=Mybloom\nNEXT_PUBLIC_TOKEN_COOKIE=mybloom_token\nNEXT_PUBLIC_SITE_URL=https://mybloom.ma\n')
f.close()
"

grep -q "missingSuspenseWithCSRBailout" /var/www/mybloom/frontend/next.config.mjs || \
  sed -i "s/const nextConfig = {/const nextConfig = {\n  experimental: { missingSuspenseWithCSRBailout: false },/" /var/www/mybloom/frontend/next.config.mjs

python3 -c "
f=open('/var/www/mybloom/frontend/components/sections/HeroSection.tsx','rb')
c=f.read(); f.close()
c=c.replace(b'/api/hero-videos',b'/api/v1/videos/hero')
f=open('/var/www/mybloom/frontend/components/sections/HeroSection.tsx','wb')
f.write(c); f.close()
"

python3 -c "
f=open('/var/www/mybloom/frontend/components/layout/Header.tsx','rb')
c=f.read(); f.close()
c=c.replace(b\"label: 'BEURRE',              href: '/collection?cat=beurre'\", b\"label: 'BEURRE CORPOREL',     href: '/collection?cat=beurre-corporel'\")
f=open('/var/www/mybloom/frontend/components/layout/Header.tsx','wb')
f.write(c); f.close()
"

echo "=== Building frontend ===
rm -rf /var/www/mybloom/frontend/.next/standalone/public"
cd /var/www/mybloom/frontend
rm -rf .next/standalone/public
npm run build
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
cp -r node_modules/sharp .next/standalone/node_modules/ 2>/dev/null || true
pm2 restart 1

echo "=== Done! ==="

echo "=== Fixing storage permissions ==="
sudo chown -R www-data:www-data /var/www/mybloom/backend/storage/app/public
sudo chmod -R 775 /var/www/mybloom/backend/storage/app/public
sudo mkdir -p /var/www/mybloom/backend/storage/framework/cache/data
sudo chown -R www-data:www-data /var/www/mybloom/backend/storage/framework
sudo chmod -R 775 /var/www/mybloom/backend/storage/framework
