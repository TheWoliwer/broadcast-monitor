const fs = require('fs');
const path = require('path');

/**
 * JSON dosyası okuma
 */
function readJSON(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    const data = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`JSON okuma hatası (${filePath}): ${error.message}`);
  }
}

/**
 * JSON dosyası yazma
 */
function writeJSON(filePath, data) {
  try {
    const fullPath = path.resolve(filePath);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    throw new Error(`JSON yazma hatası (${filePath}): ${error.message}`);
  }
}

/**
 * Sleep fonksiyonu
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Relative koordinatı absolute piksele çevirme
 */
function relativeToAbsolute(relativePos, width, height) {
  return {
    x: Math.round(relativePos.x * width),
    y: Math.round(relativePos.y * height)
  };
}

/**
 * RGB renk farkı hesaplama
 */
function colorDistance(color1, color2) {
  const rDiff = Math.abs(color1.r - color2.r);
  const gDiff = Math.abs(color1.g - color2.g);
  const bDiff = Math.abs(color1.b - color2.b);
  
  return { rDiff, gDiff, bDiff, total: rDiff + gDiff + bDiff };
}

/**
 * Renk eşleşme kontrolü (tolerans ile)
 */
function isColorMatch(actual, expected, tolerance = 5) {
  const toleranceValue = (255 * tolerance) / 100;
  
  const rMatch = Math.abs(actual.r - expected.r) <= toleranceValue;
  const gMatch = Math.abs(actual.g - expected.g) <= toleranceValue;
  const bMatch = Math.abs(actual.b - expected.b) <= toleranceValue;
  
  return rMatch && gMatch && bMatch;
}

/**
 * Siyah ekran kontrolü
 */
function isBlackScreen(rgb, threshold = 30) {
  return (rgb.r + rgb.g + rgb.b) <= threshold;
}

/**
 * Dosya var mı kontrolü
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Klasör oluşturma (yoksa)
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Tarih formatı
 */
function formatDate(date = new Date()) {
  return date.toLocaleString('tr-TR', { 
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

module.exports = {
  readJSON,
  writeJSON,
  sleep,
  relativeToAbsolute,
  colorDistance,
  isColorMatch,
  isBlackScreen,
  fileExists,
  ensureDir,
  formatDate
};
