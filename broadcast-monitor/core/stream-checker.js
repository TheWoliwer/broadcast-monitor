const BrowserManager = require('./browser-manager');
const ScreenshotAnalyzer = require('./screenshot-analyzer');
const ColorMatcher = require('./color-matcher');
const logger = require('../utils/logger');
const reportGenerator = require('../utils/report-generator');
const { readJSON, sleep } = require('../utils/helpers');
const TelegramBot = require('../telegram/bot-handler');
const settings = require('../config/settings.json');

class StreamChecker {
  constructor() {
    this.streams = null;
    this.browserManager = null;
    this.intervalId = null;
    this.isRunning = false;
    this.checkCount = 0;
  }

  /**
   * Sistemi başlat
   */
  async initialize() {
    try {
      logger.info('🚀 Broadcast Monitor başlatılıyor...');
      logger.separator();

      // Yayın listesini yükle
      this.streams = readJSON('./config/streams.json');
      logger.success(`✅ ${this.streams.machines.length} makina yüklendi`);

      // Telegram bot'u başlat
      if (settings.telegram.enabled) {
        await TelegramBot.initialize();
      }

      // Browser manager hazırla
      this.browserManager = new BrowserManager();

      logger.success('✅ Sistem hazır');
      logger.separator();
      
      return true;
    } catch (error) {
      logger.error('❌ Sistem başlatma hatası:', error);
      throw error;
    }
  }

  /**
   * Tek bir yayını kontrol et
   */
  async checkSingleStream(stream, machineInfo) {
    const result = {
      streamId: stream.streamId,
      streamName: stream.streamName,
      url: stream.url,
      type: stream.type,
      enabled: stream.enabled,
      status: 'UNKNOWN',
      errorType: null,
      message: null,
      timestamp: new Date().toISOString(),
      details: null
    };

    // Yayın kapalıysa kontrol etme
    if (!stream.enabled) {
      result.status = 'DISABLED';
      result.message = '⏸️ Yayın devre dışı';
      logger.warning(`⏸️ ${machineInfo.machineName} - Yayın ${stream.streamId}: Devre dışı`);
      return result;
    }

    try {
      logger.info(`\n🔍 Kontrol ediliyor: ${machineInfo.machineName} - ${stream.streamName}`);
      logger.info(`🔗 URL: ${stream.url}`);

      // Tarayıcıyı başlat
      await this.browserManager.init();

      // Yayına git
      await this.browserManager.navigateToStream(stream.url);

      // Debug screenshot (opsiyonel)
      if (settings.screenshot.saveDebugScreenshots) {
        const filename = `${machineInfo.machineId}-${stream.streamId}-${Date.now()}.png`;
        await this.browserManager.saveDebugScreenshot(filename);
      }

      // Screenshot al
      const screenshot = await this.browserManager.captureScreenshot();

      // Yayın tipine göre kontrol noktalarını seç
      const pattern = ColorMatcher.getPatternForStreamType(stream.type);
      logger.debug(`📋 Pattern: ${pattern.name}`);

      // Piksel analizi
      const viewportSize = this.browserManager.getViewportSize();
      const analyzedPixels = await ScreenshotAnalyzer.analyzePixels(
        screenshot,
        pattern.checkPoints,
        viewportSize
      );

      // Renk eşleştirme
      const matchResult = ColorMatcher.matchesPattern(analyzedPixels);

      // Sonucu kaydet
      result.status = matchResult.verdict;
      result.errorType = matchResult.errorType;
      result.message = matchResult.message;
      result.details = matchResult;

      // Tarayıcıyı kapat
      await this.browserManager.close();

      return result;

    } catch (error) {
      logger.error(`❌ Yayın kontrol hatası: ${error.message}`);
      
      result.status = 'ERROR';
      result.errorType = 'SYSTEM_ERROR';
      result.message = `⚠️ Sistem hatası: ${error.message}`;

      // Hata durumunda da tarayıcıyı kapat
      await this.browserManager.close();

      return result;
    }
  }

  /**
   * Bir makinadaki tüm yayınları kontrol et
   */
  async checkMachine(machine) {
    logger.separator();
    logger.info(`🖥️  ${machine.machineName} kontrol ediliyor...`);
    logger.separator();

    const machineResult = {
      machineId: machine.machineId,
      machineName: machine.machineName,
      timestamp: new Date().toISOString(),
      streams: []
    };

    for (const stream of machine.streams) {
      const streamResult = await this.checkSingleStream(stream, machine);
      machineResult.streams.push(streamResult);

      // Her yayın arasında kısa bekleme
      await sleep(2000);
    }

    return machineResult;
  }

  /**
   * Tüm makinaları kontrol et
   */
  async checkAllStreams() {
    try {
      this.checkCount++;
      logger.separator();
      logger.info(`🔄 KONTROL DÖNGÜSÜ #${this.checkCount} BAŞLADI`);
      logger.separator();

      const allResults = [];

      // Her makina sırayla
      for (const machine of this.streams.machines) {
        const machineResult = await this.checkMachine(machine);
        allResults.push(machineResult);
      }

      // Rapor oluştur
      const summary = reportGenerator.generateSystemSummary(allResults);
      reportGenerator.printConsoleReport(summary);

      // Telegram bildirimi (sadece hata varsa)
      if (settings.telegram.enabled) {
        const errors = reportGenerator.filterErrors(allResults);
        
        if (errors.length > 0 || !settings.telegram.sendOnlyErrors) {
          await TelegramBot.sendStatusReport(summary, errors);
        }
      }

      logger.success(`✅ Kontrol tamamlandı. Sonraki kontrol: ${settings.monitoring.checkInterval / 1000} saniye sonra`);
      
      return allResults;

    } catch (error) {
      logger.error('❌ Kontrol döngüsü hatası:', error);
      
      // Telegram'a hata bildirimi
      if (settings.telegram.enabled) {
        await TelegramBot.sendErrorNotification(error);
      }
    }
  }

  /**
   * Otomatik izlemeyi başlat
   */
  async startMonitoring() {
    if (this.isRunning) {
      logger.warning('⚠️ İzleme zaten çalışıyor');
      return;
    }

    this.isRunning = true;
    logger.success('▶️  Otomatik izleme başlatıldı');

    // İlk kontrolü hemen yap
    await this.checkAllStreams();

    // Periyodik kontrol
    this.intervalId = setInterval(async () => {
      await this.checkAllStreams();
    }, settings.monitoring.checkInterval);
  }

  /**
   * İzlemeyi durdur
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      logger.warning('⏸️  İzleme durduruldu');
    }
  }

  /**
   * Belirli bir yayını manuel kontrol et
   */
  async manualCheck(machineId, streamId) {
    const machine = this.streams.machines.find(m => m.machineId === machineId);
    
    if (!machine) {
      throw new Error(`Makina bulunamadı: ${machineId}`);
    }

    const stream = machine.streams.find(s => s.streamId === streamId);
    
    if (!stream) {
      throw new Error(`Yayın bulunamadı: ${streamId}`);
    }

    return await this.checkSingleStream(stream, machine);
  }
}

module.exports = StreamChecker;
