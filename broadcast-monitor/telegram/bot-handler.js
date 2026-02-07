const TelegramBot = require('node-telegram-bot-api');
const logger = require('../utils/logger');
const { formatDate } = require('../utils/helpers');
require('dotenv').config();

class TelegramBotHandler {
  constructor() {
    this.bot = null;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    this.isInitialized = false;
  }

  /**
   * Bot'u başlat
   */
  async initialize() {
    try {
      if (!this.token) {
        throw new Error('TELEGRAM_BOT_TOKEN bulunamadı (.env dosyasını kontrol edin)');
      }

      if (!this.chatId) {
        throw new Error('TELEGRAM_CHAT_ID bulunamadı (.env dosyasını kontrol edin)');
      }

      this.bot = new TelegramBot(this.token, { polling: false });
      
      // Test mesajı gönder
      await this.sendMessage('🤖 *Broadcast Monitor Başlatıldı*\n\nSistem aktif ve yayınları izlemeye başladı.');
      
      this.isInitialized = true;
      logger.success('✅ Telegram bot başarıyla başlatıldı');
      
      return true;
    } catch (error) {
      logger.error('❌ Telegram bot başlatma hatası:', error.message);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Basit mesaj gönder
   */
  async sendMessage(text, options = {}) {
    if (!this.isInitialized) {
      logger.warning('⚠️ Telegram bot başlatılmamış, mesaj gönderilemedi');
      return false;
    }

    try {
      await this.bot.sendMessage(this.chatId, text, {
        parse_mode: 'Markdown',
        ...options
      });
      
      logger.debug('📤 Telegram mesajı gönderildi');
      return true;
    } catch (error) {
      logger.error('❌ Telegram mesaj gönderme hatası:', error.message);
      return false;
    }
  }

  /**
   * Durum raporu gönder
   */
  async sendStatusReport(summary, errors) {
    if (!this.isInitialized) return false;

    try {
      let message = `📊 *YAYIN DURUM RAPORU*\n`;
      message += `⏰ ${formatDate()}\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

      // Genel özet
      message += `📈 *Genel Durum*\n`;
      message += `🖥️ Toplam Makina: ${summary.totalMachines}\n`;
      message += `📡 Toplam Yayın: ${summary.totalStreams}\n`;
      message += `✅ Aktif: ${summary.activeStreams}\n`;
      message += `❌ Hatalı: ${summary.errorStreams}\n`;
      message += `⏸️ Kapalı: ${summary.disabledStreams}\n\n`;

      // Hata varsa detayları ekle
      if (errors.length > 0) {
        message += `⚠️ *HATALI YAYINLAR:*\n\n`;

        errors.forEach(machine => {
          message += `🖥️ *${machine.machineName}*\n`;
          
          machine.errorStreams.forEach(stream => {
            const errorIcon = stream.errorType === 'BLACK_SCREEN' ? '⬛' : 
                             stream.errorType === 'SMPTE_DETECTED' ? '🎨' : '⚠️';
            
            message += `  ${errorIcon} Yayın ${stream.streamId}: ${stream.streamName}\n`;
            message += `     └ ${stream.message}\n`;
          });
          
          message += `\n`;
        });
      } else {
        message += `✅ *Tüm yayınlar normal çalışıyor!*\n`;
      }

      message += `━━━━━━━━━━━━━━━━━━━━`;

      await this.sendMessage(message);
      return true;
      
    } catch (error) {
      logger.error('❌ Telegram rapor gönderme hatası:', error.message);
      return false;
    }
  }

  /**
   * Acil hata bildirimi
   */
  async sendErrorNotification(error) {
    if (!this.isInitialized) return false;

    const message = `🚨 *SİSTEM HATASI*\n\n` +
                   `⏰ ${formatDate()}\n` +
                   `❌ ${error.message}\n\n` +
                   `Lütfen sistemi kontrol edin!`;

    return await this.sendMessage(message);
  }

  /**
   * Belirli bir makina için hata bildirimi
   */
  async sendMachineAlert(machineName, errorStreams) {
    if (!this.isInitialized) return false;

    let message = `🚨 *YAYIN UYARISI*\n\n`;
    message += `🖥️ Makina: *${machineName}*\n`;
    message += `⏰ ${formatDate()}\n\n`;

    errorStreams.forEach(stream => {
      const errorIcon = stream.errorType === 'BLACK_SCREEN' ? '⬛' : 
                       stream.errorType === 'SMPTE_DETECTED' ? '🎨' : '⚠️';
      
      message += `${errorIcon} *Yayın ${stream.streamId}*: ${stream.streamName}\n`;
      message += `└ ${stream.message}\n\n`;
    });

    return await this.sendMessage(message);
  }

  /**
   * Günlük özet raporu
   */
  async sendDailyReport(stats) {
    if (!this.isInitialized) return false;

    const message = `📅 *GÜNLÜK ÖZET RAPORU*\n\n` +
                   `📊 Toplam Kontrol: ${stats.totalChecks}\n` +
                   `✅ Başarılı: ${stats.successCount}\n` +
                   `❌ Hatalı: ${stats.errorCount}\n` +
                   `⏱️ Ortalama Yanıt Süresi: ${stats.avgResponseTime}s\n\n` +
                   `━━━━━━━━━━━━━━━━━━━━`;

    return await this.sendMessage(message);
  }

  /**
   * Bot durumunu kontrol et
   */
  async testConnection() {
    try {
      const me = await this.bot.getMe();
      logger.success(`✅ Bot bağlantısı başarılı: @${me.username}`);
      return true;
    } catch (error) {
      logger.error('❌ Bot bağlantı testi başarısız:', error.message);
      return false;
    }
  }
}

module.exports = new TelegramBotHandler();
