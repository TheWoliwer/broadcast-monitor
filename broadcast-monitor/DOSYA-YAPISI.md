# 📁 PROJE YAPISI VE DOSYA AÇIKLAMALARI

## 🗂️ Klasör Ağacı

```
broadcast-monitor/
│
├── 📄 package.json              # Proje bağımlılıkları
├── 📄 .env                      # Hassas bilgiler (Telegram token)
├── 📄 .gitignore                # Git ignore kuralları
├── 📄 README.md                 # Ana dokümantasyon
├── 📄 KURULUM.md                # Hızlı başlangıç kılavuzu
├── 📄 index.js                  # ⭐ ANA GİRİŞ NOKTASI - Sistemi başlatır
├── 📄 test.js                   # 🧪 TEST SCRIPT - Tek yayın testi
│
├── 📁 config/                   # ⚙️ YAPILANDIRMA DOSYALARI
│   ├── streams.json            # 📡 Yayın listesi (BURASI ÖNEMLİ!)
│   ├── color-patterns.json     # 🎨 SMPTE renk referansları
│   └── settings.json           # ⚙️ Genel sistem ayarları
│
├── 📁 core/                     # 🧠 ANA MOTOR - Temel işlevler
│   ├── browser-manager.js      # 🌐 Tarayıcı kontrolü (Puppeteer)
│   ├── screenshot-analyzer.js  # 📸 Görsel analiz (Sharp)
│   ├── color-matcher.js        # 🎨 Renk eşleştirme algoritması
│   └── stream-checker.js       # 🔍 Ana kontrol döngüsü
│
├── 📁 telegram/                 # 📱 TELEGRAM ENTEGRASYONU
│   ├── bot-handler.js          # 🤖 Bot yönetimi
│   ├── message-formatter.js    # 💬 Mesaj şablonları
│   └── config.json             # ⚙️ Telegram ayarları
│
├── 📁 utils/                    # 🛠️ YARDIMCI ARAÇLAR
│   ├── logger.js               # 📝 Loglama sistemi
│   ├── report-generator.js     # 📊 Rapor oluşturma
│   └── helpers.js              # 🔧 Yardımcı fonksiyonlar
│
├── 📁 logs/                     # 📋 LOG DOSYALARI (otomatik oluşur)
│   ├── .gitkeep
│   └── monitor-YYYY-MM-DD.log  # Günlük log dosyaları
│
└── 📁 screenshots/              # 📸 DEBUG SCREENSHOTS (opsiyonel)
    ├── .gitkeep
    └── test-TIMESTAMP.png       # Test screenshot'ları
```

---

## 📚 DOSYA DETAYLARI

### 🎯 Ana Dosyalar

#### **index.js** - Sistem Giriş Noktası
```javascript
// Sistemi başlatmak için:
node index.js
// veya
npm start
```

**Ne yapar:**
- Sistemi başlatır
- StreamChecker'ı initialize eder
- Otomatik izlemeyi başlatır
- Graceful shutdown yönetir

---

#### **test.js** - Tek Yayın Test Script'i
```bash
# Kullanım:
node test.js <URL> [stream-type]

# Örnekler:
node test.js https://example.com/stream1
node test.js https://example.com/stream3 usb
```

**Ne yapar:**
- Tek bir yayını test eder
- Screenshot kaydeder (debug için)
- Detaylı piksel analizi gösterir
- Renk eşleşme sonucunu raporlar

---

### ⚙️ Config Dosyaları

#### **config/streams.json** - Yayın Listesi (EN ÖNEMLİ!)

```json
{
  "machines": [
    {
      "machineId": 1,
      "machineName": "Makina-01",
      "streams": [
        {
          "streamId": 1,
          "streamName": "Slot Oyunu 1",
          "url": "https://example.com/stream1",
          "type": "rectangle",     // veya "usb"
          "enabled": true          // false = devre dışı
        }
      ]
    }
  ]
}
```

**Yayın Tipleri:**
- `rectangle`: Tam ekran yayınlar (Slot oyunları)
- `usb`: USB yayınlar (ortada içerik, yanlarda siyah)

**enabled Parametresi:**
- `true`: Yayın kontrol edilir
- `false`: Yayın atlanır (kapalı)

---

#### **config/color-patterns.json** - Renk Referansları

```json
{
  "smpte": {
    "patterns": {
      "rectangle": {
        "checkPoints": [
          {
            "name": "sol-ust",
            "relativePosition": { "x": 0.15, "y": 0.3 },
            "expectedColor": { "r": 255, "g": 255, "b": 255 }
          }
        ]
      }
    },
    "tolerance": 5,           // %5 RGB toleransı
    "minimumMatchCount": 2    // En az 2 nokta eşleşmeli
  }
}
```

**Pozisyon Sistemi:**
- `x`: 0.0 (sol) → 1.0 (sağ)
- `y`: 0.0 (üst) → 1.0 (alt)
- Örnek: `x: 0.5, y: 0.5` = tam ortada

**Renk Formatı:**
- RGB değerleri 0-255 arası
- Örnek: Beyaz = `{r: 255, g: 255, b: 255}`

---

#### **config/settings.json** - Genel Ayarlar

```json
{
  "monitoring": {
    "checkInterval": 60000,        // Kontrol aralığı (ms)
    "enabled": true
  },
  "browser": {
    "headless": true,              // false = görsel mod
    "pageLoadTimeout": 30000,
    "videoWaitTime": 10000         // Video yükleme bekleme
  },
  "screenshot": {
    "saveDebugScreenshots": false  // true = screenshot kaydet
  },
  "telegram": {
    "enabled": true,
    "sendOnlyErrors": true         // false = her raporu gönder
  }
}
```

---

### 🧠 Core Modüller

#### **core/browser-manager.js**
- Puppeteer tarayıcısını yönetir
- Sayfa yükleme ve navigasyon
- Screenshot alma (Buffer formatında)

**Önemli Fonksiyonlar:**
- `init()`: Tarayıcıyı başlat
- `navigateToStream(url)`: Yayına git
- `captureScreenshot()`: Screenshot al
- `close()`: Tarayıcıyı kapat

---

#### **core/screenshot-analyzer.js**
- Screenshot'tan piksel okuma (Sharp kütüphanesi)
- Relative → Absolute koordinat dönüşümü
- RGB değerleri çıkarma

**Önemli Fonksiyonlar:**
- `analyzePixels(buffer, checkPoints, viewport)`: Pikselleri analiz et
- `getPixelColor(buffer, x, y)`: Tek piksel oku

---

#### **core/color-matcher.js**
- Renk eşleştirme algoritması
- SMPTE pattern tespiti
- Siyah ekran kontrolü

**Önemli Fonksiyonlar:**
- `matchesPattern(analyzedPixels)`: Ana kontrol
- `getPatternForStreamType(type)`: Pattern seç

**Karar Mantığı:**
1. Tüm noktalar siyah → `BLACK_SCREEN`
2. Minimum eşleşme var → `SMPTE_DETECTED`
3. Aksi halde → `OK`

---

#### **core/stream-checker.js**
- Ana kontrol döngüsü
- Yayın listesi yönetimi
- Rapor oluşturma
- Telegram entegrasyonu

**Önemli Fonksiyonlar:**
- `initialize()`: Sistemi hazırla
- `checkSingleStream(stream)`: Tek yayın kontrol
- `checkAllStreams()`: Tüm yayınlar kontrol
- `startMonitoring()`: Otomatik izleme başlat

**Akış:**
```
1. streams.json'dan yayınları oku
2. Her makina için döngü
   3. Her yayın için:
      - Browser aç
      - Yayına git
      - Screenshot al
      - Analiz et
      - Browser kapat
4. Rapor oluştur
5. Telegram'a gönder
6. Bekle (checkInterval)
7. Goto 1
```

---

### 📱 Telegram Modülleri

#### **telegram/bot-handler.js**
- Telegram Bot API yönetimi
- Mesaj gönderme
- Bağlantı kontrolü

**Önemli Fonksiyonlar:**
- `initialize()`: Bot'u başlat
- `sendStatusReport(summary, errors)`: Durum raporu
- `sendErrorNotification(error)`: Hata bildirimi
- `sendMachineAlert(machine, errors)`: Makina uyarısı

---

#### **telegram/message-formatter.js**
- Mesaj şablonları
- Emoji ve formatlar
- Rapor formatlama

**Mesaj Tipleri:**
- Durum raporu (periyodik)
- Hata bildirimi (acil)
- Sistem başlatma
- Günlük özet

---

### 🛠️ Utils (Yardımcı Araçlar)

#### **utils/logger.js**
- Konsol ve dosya logları
- Renk kodlamalı çıktılar
- Otomatik dosya oluşturma

**Log Seviyeleri:**
- `info()`: Bilgi (mavi)
- `success()`: Başarı (yeşil)
- `warning()`: Uyarı (sarı)
- `error()`: Hata (kırmızı)
- `debug()`: Debug (mor - DEBUG_MODE=true gerekli)

---

#### **utils/report-generator.js**
- Makina bazlı raporlar
- Sistem geneli özet
- Hata filtreleme
- Konsol formatı

**Fonksiyonlar:**
- `generateMachineSummary()`: Tek makina raporu
- `generateSystemSummary()`: Tüm sistem
- `filterErrors()`: Sadece hataları çıkar
- `printConsoleReport()`: Renkli konsol çıktısı

---

#### **utils/helpers.js**
- Yardımcı fonksiyonlar
- JSON okuma/yazma
- Renk hesaplamaları
- Koordinat dönüşümü

**Önemli Fonksiyonlar:**
- `readJSON(path)`: JSON oku
- `relativeToAbsolute(pos, width, height)`: Koordinat çevir
- `isColorMatch(actual, expected, tolerance)`: Renk eşleşmesi
- `isBlackScreen(rgb, threshold)`: Siyah ekran kontrolü

---

## 🔄 ÇALIŞMA AKIŞI

### 1. Başlatma (npm start)
```
index.js
  └─> StreamChecker.initialize()
      ├─> streams.json yükle
      ├─> Telegram bot başlat
      └─> Browser manager hazırla
```

### 2. Ana Döngü
```
StreamChecker.startMonitoring()
  └─> setInterval(checkAllStreams, 60000)
      └─> Her makina için:
          └─> Her yayın için:
              ├─> BrowserManager.init()
              ├─> navigateToStream(url)
              ├─> captureScreenshot()
              ├─> ScreenshotAnalyzer.analyzePixels()
              ├─> ColorMatcher.matchesPattern()
              └─> BrowserManager.close()
```

### 3. Raporlama
```
ReportGenerator.generateSystemSummary()
  ├─> Konsola yazdır
  └─> Telegram'a gönder (hata varsa)
```

---

## 🎯 HANGİ DOSYAYI NE ZAMAN DEĞİŞTİRMELİYİM?

### Yayın eklemek/çıkarmak istiyorsanız:
→ `config/streams.json`

### Renk tespiti doğru çalışmıyorsa:
→ `config/color-patterns.json`
  - `tolerance` değerini artırın (5 → 10)
  - Kontrol noktalarını değiştirin

### Kontrol sıklığını değiştirmek için:
→ `config/settings.json`
  - `checkInterval` değerini değiştirin

### Debug yapmak için:
→ `config/settings.json`
  - `headless: false` yapın
  - `saveDebugScreenshots: true` yapın
→ `.env`
  - `DEBUG_MODE=true` yapın

### Telegram mesajlarını özelleştirmek için:
→ `telegram/message-formatter.js`

### Yeni özellik eklemek için:
→ `core/` klasöründe yeni modül oluşturun
→ `index.js` veya `stream-checker.js`'den import edin

---

## ✅ ÖNEMLİ NOKTALAR

1. **Asla dokunmayın:**
   - `node_modules/` (otomatik oluşur)
   - `logs/` (sistem otomatik doldurur)

2. **Dikkatli değiştirin:**
   - `package.json` (bağımlılık sorunlarına yol açabilir)
   - `core/` dosyaları (sistem mantığı bozulabilir)

3. **Rahatça değiştirin:**
   - `config/streams.json` (yayın yönetimi)
   - `config/settings.json` (ayarlar)
   - `telegram/message-formatter.js` (mesaj formatları)

4. **Yedeklemeyi unutmayın:**
   - Özellikle `config/` klasörünü
   - `.env` dosyasını (token kaybolmasın)

---

**Bu dosyayı yazdırıp masanızda tutabilirsiniz! 📌**
