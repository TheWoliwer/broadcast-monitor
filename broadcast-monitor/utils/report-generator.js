const { formatDate } = require('./helpers');

class ReportGenerator {
  /**
   * Makina bazlı özet rapor
   */
  generateMachineSummary(machineResults) {
    const summary = {
      machineId: machineResults.machineId,
      machineName: machineResults.machineName,
      timestamp: formatDate(),
      totalStreams: machineResults.streams.length,
      activeStreams: 0,
      errorStreams: 0,
      disabledStreams: 0,
      details: []
    };

    machineResults.streams.forEach(stream => {
      if (!stream.enabled) {
        summary.disabledStreams++;
        return;
      }

      if (stream.status === 'OK') {
        summary.activeStreams++;
      } else {
        summary.errorStreams++;
      }

      summary.details.push({
        streamId: stream.streamId,
        streamName: stream.streamName,
        status: stream.status,
        errorType: stream.errorType || null,
        message: stream.message || null
      });
    });

    return summary;
  }

  /**
   * Tüm sistem özeti
   */
  generateSystemSummary(allResults) {
    const summary = {
      timestamp: formatDate(),
      totalMachines: allResults.length,
      totalStreams: 0,
      activeStreams: 0,
      errorStreams: 0,
      disabledStreams: 0,
      machines: []
    };

    allResults.forEach(machineResult => {
      const machineSummary = this.generateMachineSummary(machineResult);
      
      summary.totalStreams += machineSummary.totalStreams;
      summary.activeStreams += machineSummary.activeStreams;
      summary.errorStreams += machineSummary.errorStreams;
      summary.disabledStreams += machineSummary.disabledStreams;
      
      summary.machines.push(machineSummary);
    });

    return summary;
  }

  /**
   * Sadece hatalı yayınları filtrele
   */
  filterErrors(allResults) {
    const errors = [];

    allResults.forEach(machineResult => {
      const machineErrors = {
        machineId: machineResult.machineId,
        machineName: machineResult.machineName,
        errorStreams: []
      };

      machineResult.streams.forEach(stream => {
        if (stream.enabled && stream.status !== 'OK') {
          machineErrors.errorStreams.push({
            streamId: stream.streamId,
            streamName: stream.streamName,
            status: stream.status,
            errorType: stream.errorType,
            message: stream.message
          });
        }
      });

      if (machineErrors.errorStreams.length > 0) {
        errors.push(machineErrors);
      }
    });

    return errors;
  }

  /**
   * Konsol için renkli rapor
   */
  printConsoleReport(summary) {
    console.log('\n' + '═'.repeat(80));
    console.log(`📊 SİSTEM DURUMU - ${summary.timestamp}`);
    console.log('═'.repeat(80));
    console.log(`Toplam Makina: ${summary.totalMachines}`);
    console.log(`Toplam Yayın: ${summary.totalStreams}`);
    console.log(`✅ Aktif: ${summary.activeStreams}`);
    console.log(`❌ Hatalı: ${summary.errorStreams}`);
    console.log(`⏸️  Kapalı: ${summary.disabledStreams}`);
    console.log('─'.repeat(80));

    summary.machines.forEach(machine => {
      console.log(`\n🖥️  ${machine.machineName} (ID: ${machine.machineId})`);
      
      machine.details.forEach(stream => {
        const statusIcon = stream.status === 'OK' ? '✅' : '❌';
        const statusColor = stream.status === 'OK' ? '\x1b[32m' : '\x1b[31m';
        
        console.log(`  ${statusIcon} Yayın ${stream.streamId}: ${statusColor}${stream.status}\x1b[0m`);
        
        if (stream.errorType) {
          console.log(`     ⚠️  Hata: ${stream.errorType}`);
        }
        if (stream.message) {
          console.log(`     💬 ${stream.message}`);
        }
      });
    });

    console.log('\n' + '═'.repeat(80) + '\n');
  }
}

module.exports = new ReportGenerator();
