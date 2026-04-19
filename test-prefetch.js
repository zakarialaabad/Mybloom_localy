#!/usr/bin/env node

// Test script to verify prefetching functionality
// This simulates hovering over a product card and checking if prefetching works

const puppeteer = require('puppeteer');

async function testPrefetching() {
  console.log('🚀 Starting prefetching test...');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Enable console logging from the page
  page.on('console', msg => {
    if (msg.text().includes('[CatalogStore]')) {
      console.log('📝 Store Log:', msg.text());
    }
  });

  // Navigate to homepage
  console.log('📍 Navigating to homepage...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });

  // Wait for products to load
  await page.waitForSelector('.product-card', { timeout: 10000 });
  console.log('✅ Homepage loaded with products');

  // Get first product card
  const firstProduct = await page.$('.product-card');
  if (!firstProduct) {
    console.error('❌ No product cards found');
    await browser.close();
    return;
  }

  // Get product slug from href
  const href = await firstProduct.evaluate(el => el.getAttribute('href'));
  const slug = href.replace('/product/', '');
  console.log(`🎯 Testing prefetch for product: ${slug}`);

  // Hover over the product card for 500ms (longer than our 300ms delay)
  console.log('🖱️  Hovering over product card...');
  await firstProduct.hover();
  await page.waitForTimeout(500);

  // Check if prefetch request was made
  const requests = [];
  page.on('request', req => {
    if (req.url().includes(`/v1/products/${slug}`)) {
      requests.push(req.url());
      console.log('🌐 Prefetch request detected:', req.url());
    }
  });

  // Wait a bit more to see if prefetch happens
  await page.waitForTimeout(1000);

  // Now click the product card
  console.log('🖱️  Clicking product card...');
  await firstProduct.click();

  // Wait for navigation
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log('✅ Navigated to product detail page');

  // Check if the page loaded instantly (no skeleton)
  const hasSkeleton = await page.$('.animate-pulse');
  if (hasSkeleton) {
    console.log('⚠️  Skeleton still showing - prefetch may not have worked');
  } else {
    console.log('✅ No skeleton - prefetch worked!');
  }

  // Check console logs for cache hits
  console.log('📊 Test completed. Check logs above for cache behavior.');

  await browser.close();
}

testPrefetching().catch(console.error);