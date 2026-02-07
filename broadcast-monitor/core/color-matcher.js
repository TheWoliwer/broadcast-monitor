const logger = require('../utils/logger');
const { isColorMatch, isBlackScreen, colorDistance } = require('../utils/helpers');
const colorPatterns = require('../config/color-patterns.json');

class ColorMatcher {
  constructor() {
    this.tolerance = colorPatterns.smpte.tolerance;
    this.minimumMatchCount = colorPatterns.smpte.minimumMatchCount;
    this.blackThreshold = colorPatterns.smpte.blackScreenThreshold.maxRGB;
  }

  /**
   * Ana kontrol fonksiyonu - SMPTE pattern kontrolü
   */
  matchesPattern(analyzedPixels) {
    const results = {
      isSMPTEDetected: false,
      isBlackScreen: false,
      matchCount: 0,
      totalPoints: analyzedPixels.length,
      details: [],
      verdict: 'OK',
      errorType: null,
      message: null
    };

    let blackPixelCount = 0;

    // Her kontrol noktasını değerlendir
    analyzedPixels.forEach(pixel => {
      const matched = isColorMatch(
        pixel.actualColor,
        pixel.expectedColor,
        this.tolerance
      );

      const isBlack = isBlackScreen(pixel.actualColor, this.blackThreshold);
      
      if (isBlack) {
        blackPixelCount++;
      }

      if (matched) {
        results.matchCount++;
      }

      const distance = colorDistance(pixel.actualColor, pixel.expectedColor);

      results.details.push({
        point: pixel.name,
        expected: pixel.expectedColor,
        actual: pixel.actualColor,
        matched: matched,
        isBlack: isBlack,
        colorDifference: distance.total,
        description: pixel.description
      });

      // Log detayı
      const matchIcon = matched ? '✅' : '❌';
      const blackIcon = isBlack ? '⬛' : '';
      logger.debug(
        `  ${matchIcon} ${blackIcon} ${pixel.name}: ` +
        `Beklenen RGB(${pixel.expectedColor.r},${pixel.expectedColor.g},${pixel.expectedColor.b}) | ` +
        `Gerçek RGB(${pixel.actualColor.r},${pixel.actualColor.g},${pixel.actualColor.b}) | ` +
        `Fark: ${distance.total}`
      );
    });

    // Karar mekanizması
    if (blackPixelCount === analyzedPixels.length) {
      // Tüm noktalar siyah - USB yayın kopmuş olabilir
      results.isBlackScreen = true;
      results.verdict = 'ERROR';
      results.errorType = 'BLACK_SCREEN';
      results.message = '⬛ Siyah ekran tespit edildi (Yayın kopmuş olabilir)';
      
    } else if (results.matchCount >= this.minimumMatchCount) {
      // SMPTE renk barları tespit edildi
      results.isSMPTEDetected = true;
      results.verdict = 'ERROR';
      results.errorType = 'SMPTE_DETECTED';
      results.message = `🎨 SMPTE test ekranı tespit edildi (${results.matchCount}/${results.totalPoints} nokta eşleşti)`;
      
    } else {
      // Normal yayın devam ediyor
      results.verdict = 'OK';
      results.message = '✅ Yayın normal devam ediyor';
    }

    logger.info(`📊 Sonuç: ${results.verdict} - ${results.message}`);

    return results;
  }

  /**
   * Yayın tipine göre pattern seç
   */
  getPatternForStreamType(streamType) {
    const patterns = colorPatterns.smpte.patterns;
    
    if (streamType === 'usb') {
      return patterns.usb;
    } else {
      return patterns.rectangle;
    }
  }

  /**
   * Manuel renk kontrolü (test amaçlı)
   */
  checkSingleColor(actualRGB, expectedRGB, tolerance = null) {
    const tol = tolerance || this.tolerance;
    return isColorMatch(actualRGB, expectedRGB, tol);
  }

  /**
   * Tolerans değerini güncelle (runtime'da)
   */
  setTolerance(newTolerance) {
    logger.info(`🎚️ Renk toleransı güncellendi: %${this.tolerance} → %${newTolerance}`);
    this.tolerance = newTolerance;
  }

  /**
   * Minimum eşleşme sayısını güncelle
   */
  setMinimumMatchCount(count) {
    logger.info(`🔢 Minimum eşleşme sayısı güncellendi: ${this.minimumMatchCount} → ${count}`);
    this.minimumMatchCount = count;
  }
}

module.exports = new ColorMatcher();
