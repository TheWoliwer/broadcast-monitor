const { formatDate } = require('../utils/helpers');

class MessageFormatter {
  /**
   * Durum ikonu seç
   */
  getStatusIcon(status) {
    const icons = {
      'OK': '✅',
      'ERROR': '❌',
      'DISABLED': '⏸️',
      'UNKNOWN': '❓',
      'BLACK_SCREEN': '⬛',
      'SMPTE_DETECTED': '🎨',
      'SYSTEM_ERROR': '⚠️'
    };
    
    return icons[status] || '❓';
  }

  /**
   * Makina başlığı
   */
  formatMachineHeader(machineName, machineId) {
    return `🖥️ *${machineName}* (ID: ${machineId})`;
  }

  /**
   * Yayın durumu satırı
   */
  formatStreamStatus(stream) {
    const icon = this.getStatusIcon(stream.status);
    let line = `  ${icon} *Yayın ${stream.streamId}*: ${stream.streamName}`;
    
    if (stream.status !== 'OK' && stream.status !== 'DISABLED') {
      line += `\n     └ _${stream.message}_`;
    }
    
    return line;
  }

  /**
   * Özet istatistikler
   */
  formatSummaryStats(summary) {
    return `📈 *Genel Durum*\n` +
           `🖥️ Toplam Makina: ${summary.totalMachines}\n` +
           `📡 Toplam Yayın: ${summary.totalStreams}\n` +
           `✅ Aktif: ${summary.activeStreams}\n` +
           `❌ Hatalı: ${summary.errorStreams}\n` +
           `⏸️ Kapalı: ${summary.disabledStreams}`;
  }

  /**
   * Tam durum raporu
   */
  formatFullReport(summary) {
    let message = `📊 *YAYIN DURUM RAPORU*\n`;
    message += `⏰ ${formatDate()}\n`;
    message += `${'━'.repeat(20)}\n\n`;

    // Genel istatistikler
    message += this.formatSummaryStats(summary) + '\n\n';

    // Makina detayları
    message += `📋 *Detaylar:*\n\n`;
    
    summary.machines.forEach(machine => {
      message += this.formatMachineHeader(machine.machineName, machine.machineId) + '\n';
      
      machine.details.forEach(stream => {
        message += this.formatStreamStatus(stream) + '\n';
      });
      
      message += '\n';
    });

    message += `${'━'.repeat(20)}`;
    
    return message;
  }

  /**
   * Sadece hatalar raporu
   */
  formatErrorReport(errors) {
    if (errors.length === 0) {
      return `✅ *Tüm yayınlar normal çalışıyor!*\n⏰ ${formatDate()}`;
    }

    let message = `🚨 *HATALI YAYINLAR*\n`;
    message += `⏰ ${formatDate()}\n`;
    message += `${'━'.repeat(20)}\n\n`;

    errors.forEach(machine => {
      message += `🖥️ *${machine.machineName}*\n`;
      
      machine.errorStreams.forEach(stream => {
        const icon = this.getStatusIcon(stream.errorType || stream.status);
        message += `  ${icon} Yayın ${stream.streamId}: ${stream.streamName}\n`;
        message += `     └ _${stream.message}_\n`;
      });
      
      message += '\n';
    });

    message += `${'━'.repeat(20)}`;
    
    return message;
  }

  /**
   * Acil uyarı mesajı
   */
  formatUrgentAlert(machineName, streamName, errorType, message) {
    const icon = this.getStatusIcon(errorType);
    
    return `🚨 *ACİL UYARI*\n\n` +
           `🖥️ Makina: *${machineName}*\n` +
           `📡 Yayın: *${streamName}*\n` +
           `${icon} Durum: *${errorType}*\n\n` +
           `💬 ${message}\n\n` +
           `⏰ ${formatDate()}`;
  }

  /**
   * Sistem başlatma mesajı
   */
  formatStartupMessage(machineCount, streamCount) {
    return `🤖 *Broadcast Monitor Başlatıldı*\n\n` +
           `✅ Sistem aktif\n` +
           `🖥️ ${machineCount} makina\n` +
           `📡 ${streamCount} yayın izleniyor\n\n` +
           `⏰ ${formatDate()}`;
  }

  /**
   * Test mesajı
   */
  formatTestMessage() {
    return `🧪 *Test Mesajı*\n\n` +
           `✅ Telegram bağlantısı başarılı\n` +
           `⏰ ${formatDate()}`;
  }

  /**
   * Günlük özet
   */
  formatDailySummary(stats) {
    return `📅 *GÜNLÜK ÖZET RAPORU*\n\n` +
           `📊 Toplam Kontrol: ${stats.totalChecks}\n` +
           `✅ Başarılı: ${stats.successCount}\n` +
           `❌ Hatalı: ${stats.errorCount}\n` +
           `⚠️ Sistem Hatası: ${stats.systemErrors}\n` +
           `⏱️ Ortalama Süre: ${stats.avgDuration}s\n\n` +
           `━━━━━━━━━━━━━━━━━━━━\n` +
           `⏰ ${formatDate()}`;
  }
}

module.exports = new MessageFormatter();
