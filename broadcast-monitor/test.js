#!/usr/bin/env node

/**
 * Test Script - Tek Yayın Kontrolü
 * 
 * Kullanım: node test.js <URL>
 * Örnek: node test.js https://example.com/stream1
 */

require('dotenv').config();
const BrowserManager = require('./core/browser-manager');
const ScreenshotAnalyzer = require('./core/screenshot-analyzer');
const ColorMatcher = require('./core/color-matcher');
const logger = require('./utils/logger');
const path = require('path');

async function testSingleStream(url, streamType = 'rectangle') {
  const browserManager = new BrowserManager();
  
  try {
    logger.separator();
    logger.info('🧪 TEK YAYIN TEST MODU');
    logger.separator();
    logger.info(`🔗 URL: ${url}`);
    logger.info(`📋 Yayın Tipi: ${streamType}`);
    logger.separator();

    // Tarayıcıyı başlat
    await browserManager.init();

    // Yayına git
    await browserManager.navigateToStream(url);

    // Debug screenshot kaydet
    const timestamp = Date.now();
    const screenshotPath = path.join(__dirname, 'screenshots', `test-${timestamp}.png`);
    
    try {
      await browserManager.page.screenshot({ path: screenshotPath });
      logger.success(`📸 Screenshot kaydedildi: ${screenshotPath}`);
    } catch (err) {
      logger.warning('⚠️ Screenshot kaydetme hatası:', err.message);
    }

    // Screenshot al (buffer)
    const screenshot = await browserManager.captureScreenshot();

    // Pattern seç
    const pattern = ColorMatcher.getPatternForStreamType(streamType);
    logger.info(`📋 Kullanılan Pattern: ${pattern.name}`);
    logger.info(`📍 Kontrol Noktaları: ${pattern.checkPoints.length} adet`);

    // Piksel analizi
    const viewportSize = browserManager.getViewportSize();
    logger.debug(`📐 Viewport: ${viewportSize.width}x${viewportSize.height}`);
    
    const analyzedPixels = await ScreenshotAnalyzer.analyzePixels(
      screenshot,
      pattern.checkPoints,
      viewportSize
    );

    // Sonuçları göster
    logger.separator();
    logger.info('🔍 DETAYLI ANALİZ SONUÇLARI:');
    logger.separator();

    analyzedPixels.forEach((pixel, index) => {
      console.log(`\n📍 Nokta ${index + 1}: ${pixel.name}`);
      console.log(`   Pozisyon: X=${pixel.position.x}, Y=${pixel.position.y}`);
      console.log(`   Beklenen RGB: (${pixel.expectedColor.r}, ${pixel.expectedColor.g}, ${pixel.expectedColor.b})`);
      console.log(`   Gerçek RGB: (${pixel.actualColor.r}, ${pixel.actualColor.g}, ${pixel.actualColor.b})`);
      console.log(`   Açıklama: ${pixel.description}`);
    });

    // Renk eşleştirme
    logger.separator();
    const matchResult = ColorMatcher.matchesPattern(analyzedPixels);

    logger.separator();
    logger.info('📊 SONUÇ:');
    logger.separator();
    console.log(`Durum: ${matchResult.verdict}`);
    console.log(`Eşleşen Nokta: ${matchResult.matchCount}/${matchResult.totalPoints}`);
    console.log(`SMPTE Tespit: ${matchResult.isSMPTEDetected ? 'EVET ❌' : 'HAYIR ✅'}`);
    console.log(`Siyah Ekran: ${matchResult.isBlackScreen ? 'EVET ⬛' : 'HAYIR ✅'}`);
    console.log(`Mesaj: ${matchResult.message}`);
    
    if (matchResult.errorType) {
      console.log(`Hata Tipi: ${matchResult.errorType}`);
    }

    logger.separator();

    // Tarayıcıyı kapat
    await browserManager.close();

    return matchResult;

  } catch (error) {
    logger.error('❌ Test hatası:', error);
    await browserManager.close();
    throw error;
  }
}

// Komut satırı argümanları
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('❌ Kullanım: node test.js <URL> [stream-type]');
  console.log('');
  console.log('Örnekler:');
  console.log('  node test.js https://example.com/stream1');
  console.log('  node test.js https://example.com/stream1 rectangle');
  console.log('  node test.js https://example.com/stream3 usb');
  console.log('');
  console.log('Stream Types:');
  console.log('  - rectangle: Tam ekran yayınlar (varsayılan)');
  console.log('  - usb: USB yayınlar (ortada içerik, yanlarda siyah)');
  process.exit(1);
}

const testUrl = args[0];
const streamType = args[1] || 'rectangle';

// Test'i çalıştır
testSingleStream(testUrl, streamType)
  .then(result => {
    if (result.verdict === 'OK') {
      logger.success('✅ Test başarılı - Yayın normal çalışıyor');
      process.exit(0);
    } else {
      logger.error('❌ Test sonucu - Yayında sorun tespit edildi');
      process.exit(1);
    }
  })
  .catch(error => {
    logger.error('💥 Test başarısız:', error);
    process.exit(1);
  });
