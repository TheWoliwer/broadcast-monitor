#!/usr/bin/env node

/**
 * Broadcast Monitor - Ana Giriş Dosyası
 * 
 * Otomatik yayın denetleme ve renk analizi sistemi
 * SMPTE test ekranı ve siyah ekran tespiti
 */

require('dotenv').config();
const StreamChecker = require('./core/stream-checker');
const logger = require('./utils/logger');

// Global değişkenler
let streamChecker = null;

/**
 * Ana başlatma fonksiyonu
 */
async function main() {
  try {
    logger.separator();
    logger.info('🚀 BROADCAST MONITOR BAŞLATILIYOR...');
    logger.separator();

    // Ortam bilgileri
    logger.info(`📍 Çalışma Dizini: ${process.cwd()}`);
    logger.info(`🔧 Node Versiyonu: ${process.version}`);
    logger.info(`💻 Platform: ${process.platform}`);
    logger.separator();

    // Stream checker'ı başlat
    streamChecker = new StreamChecker();
    await streamChecker.initialize();

    // İzlemeyi başlat
    await streamChecker.startMonitoring();

    logger.success('✅ Sistem başarıyla başlatıldı ve çalışıyor!');
    logger.info('ℹ️  Durdurmak için CTRL+C tuşlarına basın');
    
  } catch (error) {
    logger.error('❌ Kritik Hata:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function shutdown(signal) {
  logger.separator();
  logger.warning(`⚠️  ${signal} sinyali alındı, sistem kapatılıyor...`);
  
  if (streamChecker) {
    streamChecker.stopMonitoring();
  }

  logger.info('👋 Güle güle!');
  logger.separator();
  
  process.exit(0);
}

// Sinyal yakalayıcılar
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Yakalanmamış hataları logla
process.on('uncaughtException', (error) => {
  logger.error('💥 Yakalanmamış Hata:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Yakalanmamış Promise Reddi:', reason);
});

// Başlat
main();
