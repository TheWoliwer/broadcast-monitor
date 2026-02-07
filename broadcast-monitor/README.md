# 🎥 Broadcast Monitor

Otomatik yayın denetleme ve renk analizi sistemi. Canlı yayınların kesilip kesilmediğini SMPTE renk barları ve siyah ekran tespiti ile kontrol eder.

## 📋 Özellikler

- ✅ Otomatik yayın izleme (periyodik kontrol)
- 🎨 SMPTE test ekranı tespiti
- ⬛ Siyah ekran tespiti
- 📱 Telegram bildirim sistemi
- 📊 Detaylı raporlama
- 🔧 Modüler ve genişletilebilir yapı
- 💾 JSON tabanlı yayın yönetimi

## 🏗️ Proje Yapısı

```
broadcast-monitor/
├── config/                 # Yapılandırma dosyaları
│   ├── streams.json       # Yayın listesi
│   ├── color-patterns.json # SMPTE renk referansları
│   └── settings.json      # Genel ayarlar
├── core/                  # Ana modüller
│   ├── browser-manager.js
│   ├── screenshot-analyzer.js
│   ├── color-matcher.js
│   └── stream-checker.js
├── telegram/              # Telegram entegrasyonu
│   ├── bot-handler.js
│   ├── message-formatter.js
│   └── config.json
├── utils/                 # Yardımcı araçlar
│   ├── logger.js
│   ├── report-generator.js
│   └── helpers.js
├── logs/                  # Log dosyaları
├── screenshots/           # Debug screenshots
├── .env                   # Ortam değişkenleri
├── index.js              # Ana giriş
├── test.js               # Test script
└── package.json
```

## 🚀 Kurulum

### 1. Gereksinimler

- Node.js v18 veya üzeri
- Windows Server (test edildi)
- İnternet bağlantısı

### 2. Bağımlılıkları Yükle

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarla

`.env` dosyasını düzenleyin:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
NODE_ENV=production
DEBUG_MODE=false
SAVE_SCREENSHOTS=false
```

### 4. Yayın Listesini Yapılandır

`config/streams.json` dosyasını düzenleyin:

```json
{
  "machines": [
    {
      "machineId": 1,
      "machineName": "Makina-01",
      "streams": [
        {
          "streamId": 1,
          "streamName": "Yayın 1",
          "url": "https://example.com/stream1",
          "type": "rectangle",
          "enabled": true
        }
      ]
    }
  ]
}
```

## 📱 Kullanım

### Sistemi Başlat

```bash
npm start
# veya
node index.js
```

### Tek Yayın Testi

```bash
node test.js <URL> [stream-type]

# Örnekler:
node test.js https://example.com/stream1
node test.js https://example.com/stream1 rectangle
node test.js https://example.com/stream3 usb
```

### Dev Mode (Debug)

```bash
# .env dosyasında
DEBUG_MODE=true
SAVE_SCREENSHOTS=true

npm start
```

## ⚙️ Yapılandırma

### Kontrol Aralığı

`config/settings.json`:

```json
{
  "monitoring": {
    "checkInterval": 60000  // 60 saniye = 1 dakika
  }
}
```

### Renk Toleransı

`config/color-patterns.json`:

```json
{
  "smpte": {
    "tolerance": 5,  // %5 RGB toleransı
    "minimumMatchCount": 2  // En az 2 nokta eşleşmeli
  }
}
```

### Yayın Tipleri

#### 1. Rectangle (Dikdörtgen - Tip 1-2)
- Tam ekran yayınlar
- Kontrol noktaları: Sol-Üst, Orta-Orta, Sağ-Üst

#### 2. USB (Tip 3)
- Ortada içerik, yanlarda siyah alan
- Kontrol noktaları: Orta-Yukarı, Orta-Orta, Orta-Aşağı

## 📊 Raporlama

### Konsol Çıktısı

```
═════════════════════════════════════════
📊 SİSTEM DURUMU - 07.02.2026 23:30:15
═════════════════════════════════════════
Toplam Makina: 2
Toplam Yayın: 6
✅ Aktif: 5
❌ Hatalı: 1
⏸️  Kapalı: 0
```

### Telegram Bildirimleri

- ✅ Sistem başlatma
- ❌ Hatalı yayın tespiti
- 📊 Periyodik durum raporu
- 🚨 Kritik hatalar

## 🛠️ Sorun Giderme

### Tarayıcı Başlatma Hatası

```bash
# Chromium otomatik indirilecek, ancak hata alırsanız:
npm install puppeteer --force
```

### Telegram Bağlantı Sorunu

1. Bot token'ı kontrol edin
2. Chat ID'yi doğrulayın
3. Bot'u gruba ekleyin ve admin yapın

### Screenshot Hatası

```json
// settings.json
{
  "browser": {
    "headless": false  // Görsel mod (debug için)
  }
}
```

## 📝 Log Dosyaları

Loglar otomatik olarak `logs/` klasörüne kaydedilir:

```
logs/
├── monitor-2026-02-07.log
├── monitor-2026-02-08.log
└── ...
```

## 🔐 Güvenlik

- `.env` dosyasını asla paylaşmayın
- Telegram bot token'ını güvende tutun
- `.gitignore` dosyası hassas bilgileri korur

## 🤝 Katkıda Bulunma

1. Yeni özellikler için `config/streams.json` düzenleyin
2. Renk pattern'leri için `config/color-patterns.json` güncelleyin
3. Telegram mesaj formatı için `telegram/message-formatter.js` düzenleyin

## 📜 Lisans

ISC

## 🆘 Destek

Sorun bildirimek için log dosyalarını gönderin:
- `logs/monitor-<tarih>.log`
- Debug screenshot'ları (varsa)

---

**Geliştirici**: Broadcast Monitor Team
**Versiyon**: 1.0.0
**Son Güncelleme**: Şubat 2026
