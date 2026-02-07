const puppeteer = require('puppeteer');
const logger = require('../utils/logger');
const { sleep } = require('../utils/helpers');
const settings = require('../config/settings.json');

class BrowserManager {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * Tarayıcıyı başlat
   */
  async init() {
    try {
      logger.info('🌐 Tarayıcı başlatılıyor...');
      
      this.browser = await puppeteer.launch({
        headless: settings.browser.headless,
        args: settings.browser.args,
        defaultViewport: {
          width: settings.browser.viewportWidth,
          height: settings.browser.viewportHeight
        }
      });

      this.page = await this.browser.newPage();
      
      // User agent ayarla
      await this.page.setUserAgent(settings.browser.userAgent);
      
      // Timeout ayarları
      this.page.setDefaultTimeout(settings.browser.pageLoadTimeout);
      
      logger.success('✅ Tarayıcı başarıyla başlatıldı');
      return true;
    } catch (error) {
      logger.error('❌ Tarayıcı başlatma hatası:', error.message);
      throw error;
    }
  }

  /**
   * URL'ye git ve video yüklenmesini bekle
   */
  async navigateToStream(url) {
    try {
      logger.info(`📡 Yayına bağlanılıyor: ${url}`);
      
      // Sayfaya git
      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: settings.browser.pageLoadTimeout
      });

      logger.info('⏳ Video player yükleniyor...');
      
      // Video elementi bekle (opsiyonel - bazı sitelerde olmayabilir)
      try {
        await this.page.waitForSelector('video', { 
          timeout: 5000 
        });
        logger.debug('Video elementi bulundu');
      } catch {
        logger.debug('Video elementi bulunamadı (iframe veya custom player olabilir)');
      }

      // Video render olması için sabit bekleme
      await sleep(settings.browser.videoWaitTime);
      
      logger.success('✅ Sayfa yüklendi');
      return true;
    } catch (error) {
      logger.error(`❌ Sayfa yükleme hatası: ${error.message}`);
      throw error;
    }
  }

  /**
   * Screenshot al (Buffer olarak)
   */
  async captureScreenshot() {
    try {
      const screenshot = await this.page.screenshot({
        type: settings.screenshot.format,
        encoding: 'binary',
        fullPage: false
      });

      logger.debug(`📸 Screenshot alındı (${screenshot.length} bytes)`);
      return screenshot;
    } catch (error) {
      logger.error('❌ Screenshot alma hatası:', error.message);
      throw error;
    }
  }

  /**
   * Debug için screenshot kaydet
   */
  async saveDebugScreenshot(filename) {
    if (!settings.screenshot.saveDebugScreenshots) {
      return;
    }

    try {
      const path = require('path');
      const fs = require('fs');
      const { ensureDir } = require('../utils/helpers');
      
      ensureDir(settings.screenshot.debugPath);
      
      const filepath = path.join(settings.screenshot.debugPath, filename);
      await this.page.screenshot({ path: filepath });
      
      logger.debug(`💾 Debug screenshot kaydedildi: ${filepath}`);
    } catch (error) {
      logger.warning('⚠️ Debug screenshot kaydedilemedi:', error.message);
    }
  }

  /**
   * Viewport boyutlarını al
   */
  getViewportSize() {
    return {
      width: settings.browser.viewportWidth,
      height: settings.browser.viewportHeight
    };
  }

  /**
   * Tarayıcıyı kapat
   */
  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        logger.info('🔒 Tarayıcı kapatıldı');
      }
    } catch (error) {
      logger.error('❌ Tarayıcı kapatma hatası:', error.message);
    }
  }

  /**
   * Sayfa yenile
   */
  async reload() {
    try {
      await this.page.reload({ waitUntil: 'networkidle2' });
      await sleep(settings.browser.videoWaitTime);
      logger.debug('🔄 Sayfa yenilendi');
    } catch (error) {
      logger.error('❌ Sayfa yenileme hatası:', error.message);
      throw error;
    }
  }
}

module.exports = BrowserManager;
