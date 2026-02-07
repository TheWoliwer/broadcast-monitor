const sharp = require('sharp');
const logger = require('../utils/logger');
const { relativeToAbsolute } = require('../utils/helpers');

class ScreenshotAnalyzer {
  /**
   * Screenshot'tan belirtilen noktalardaki pikselleri oku
   */
  async analyzePixels(screenshotBuffer, checkPoints, viewportSize) {
    try {
      logger.debug(`🔍 ${checkPoints.length} nokta analiz ediliyor...`);

      const image = sharp(screenshotBuffer);
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

      const results = [];

      for (const point of checkPoints) {
        // Relative pozisyonu absolute piksele çevir
        const absPos = relativeToAbsolute(
          point.relativePosition,
          viewportSize.width,
          viewportSize.height
        );

        // Piksel rengini oku
        const rgb = this.getPixelColor(data, absPos.x, absPos.y, info.width, info.channels);

        results.push({
          name: point.name,
          position: absPos,
          actualColor: rgb,
          expectedColor: point.expectedColor,
          description: point.description
        });

        logger.debug(`  📍 ${point.name}: RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`);
      }

      return results;
    } catch (error) {
      logger.error('❌ Piksel analiz hatası:', error.message);
      throw error;
    }
  }

  /**
   * Belirli bir pikselin rengini oku
   */
  getPixelColor(buffer, x, y, width, channels) {
    const idx = (y * width + x) * channels;
    
    return {
      r: buffer[idx],
      g: buffer[idx + 1],
      b: buffer[idx + 2]
    };
  }

  /**
   * Birden fazla noktanın ortalamasını al (opsiyonel)
   */
  async getAverageColorInArea(screenshotBuffer, centerX, centerY, radius = 3) {
    try {
      const image = sharp(screenshotBuffer);
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

      let totalR = 0, totalG = 0, totalB = 0;
      let count = 0;

      // Merkez noktanın etrafındaki pikselleri de oku
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const x = centerX + dx;
          const y = centerY + dy;

          if (x >= 0 && x < info.width && y >= 0 && y < info.height) {
            const rgb = this.getPixelColor(data, x, y, info.width, info.channels);
            totalR += rgb.r;
            totalG += rgb.g;
            totalB += rgb.b;
            count++;
          }
        }
      }

      return {
        r: Math.round(totalR / count),
        g: Math.round(totalG / count),
        b: Math.round(totalB / count)
      };
    } catch (error) {
      logger.error('❌ Alan renk hesaplama hatası:', error.message);
      throw error;
    }
  }

  /**
   * Screenshot metadata'sını al
   */
  async getImageInfo(screenshotBuffer) {
    try {
      const image = sharp(screenshotBuffer);
      const metadata = await image.metadata();
      
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: screenshotBuffer.length
      };
    } catch (error) {
      logger.error('❌ Image metadata okuma hatası:', error.message);
      throw error;
    }
  }
}

module.exports = new ScreenshotAnalyzer();
