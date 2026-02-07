# 🚀 HIZLI BAŞLANGIÇ KILAVUZU

## ⚡ 5 Dakikada Kurulum

### 1. Proje Dosyalarını Windows Server'a Kopyalayın

Tüm `broadcast-monitor` klasörünü Windows Server'a kopyalayın.

### 2. Node.js Kurulumu Kontrol Edin

```cmd
node --version
```

Eğer Node.js kurulu değilse: https://nodejs.org (v18 veya üzeri)

### 3. Proje Klasörüne Gidin

```cmd
cd broadcast-monitor
```

### 4. Bağımlılıkları Yükleyin

```cmd
npm install
```

Bu işlem 2-3 dakika sürer ve şunları yükler:
- puppeteer (tarayıcı otomasyonu)
- sharp (görsel işleme)
- node-telegram-bot-api (telegram entegrasyonu)
- dotenv (ortam değişkenleri)

### 5. İlk Test (Bozuk Yayın Linki ile)

```cmd
node test.js https://BOZUK_YAYIN_LINKINIZ
```

Bu komut:
1. Tarayıcıyı açar
2. Yayına bağlanır
3. Screenshot alır (`screenshots/` klasörüne kaydeder)
4. Renk analizi yapar
5. Sonucu gösterir

**Beklenen Çıktı (Bozuk Yayın):**

```
🧪 TEK YAYIN TEST MODU
═══════════════════════════════════════
🔗 URL: https://...
📋 Yayın Tipi: rectangle
═══════════════════════════════════════
🌐 Tarayıcı başlatılıyor...
✅ Tarayıcı başarıyla başlatıldı
📡 Yayına bağlanılıyor...
⏳ Video player yükleniyor...
✅ Sayfa yüklendi
📸 Screenshot alındı
...
📊 SONUÇ:
═══════════════════════════════════════
Durum: ERROR
SMPTE Tespit: EVET ❌
Mesaj: 🎨 SMPTE test ekranı tespit edildi
```

## 📝 Test Sonrası Yapılacaklar

### ✅ Test Başarılı İse:

1. **Yayın Listesini Güncelleyin**
   
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
             "streamName": "Slot 1",
             "url": "https://GERÇEK_LINK_1",
             "type": "rectangle",
             "enabled": true
           },
           {
             "streamId": 2,
             "streamName": "Slot 2",
             "url": "https://GERÇEK_LINK_2",
             "type": "rectangle",
             "enabled": true
           },
           {
             "streamId": 3,
             "streamName": "USB Yayın",
             "url": "https://GERÇEK_LINK_3",
             "type": "usb",
             "enabled": true
           }
         ]
       }
     ]
   }
   ```

2. **Sistemi Başlatın**

   ```cmd
   npm start
   ```

   Sistem artık her 60 saniyede bir tüm yayınları kontrol edecek.

3. **Telegram'dan Bildirimleri İzleyin**

   Bot otomatik olarak:
   - Sistem başlatıldığında bilgi verir
   - Hatalı yayın tespit ettiğinde uyarır
   - Durum raporları gönderir

### ❌ Test Başarısız İse:

**Sorun 1: Tarayıcı Açılmıyor**
```cmd
npm install puppeteer --force
```

**Sorun 2: Screenshot Alınamıyor**

`config/settings.json` içinde:
```json
{
  "browser": {
    "headless": false  // Görsel mod
  }
}
```

**Sorun 3: Renk Tespit Edilmiyor**

Debug mode açın:
- `.env` dosyasında `DEBUG_MODE=true` yapın
- `SAVE_SCREENSHOTS=true` yapın
- `screenshots/` klasöründeki görselleri inceleyin

## 🎯 Renk Noktalarını Ayarlama

Eğer renk tespiti çalışmıyorsa, kontrol noktalarını ayarlamanız gerekebilir.

`config/color-patterns.json` dosyasını açın:

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
    "tolerance": 5  // Bunu 10'a çıkarabilirsiniz
  }
}
```

**Pozisyon Hesaplama:**
- `x: 0.15` = Ekranın soldan %15'inde
- `y: 0.3` = Ekranın yukarıdan %30'unda
- Değerler 0.0 ile 1.0 arasında olmalı

## 🔧 İleri Seviye Ayarlar

### Kontrol Sıklığını Değiştirme

`config/settings.json`:
```json
{
  "monitoring": {
    "checkInterval": 30000  // 30 saniye
  }
}
```

### Headless Mode Kapatma (Debug)

`config/settings.json`:
```json
{
  "browser": {
    "headless": false  // Tarayıcı görünür olacak
  }
}
```

### Telegram Bildirimleri Kapatma

`config/settings.json`:
```json
{
  "telegram": {
    "enabled": false
  }
}
```

## 📞 Yardım

### Log Dosyalarını İnceleyin

```cmd
cd logs
type monitor-2026-02-07.log
```

### Test Modunda Çalıştırın

```cmd
# Debug mode
set DEBUG_MODE=true
node test.js https://LINK
```

### Screenshot'ları Kontrol Edin

`screenshots/` klasöründe kaydedilen görselleri açıp:
1. SMPTE renk barlarının görünüp görünmediğini
2. Kontrol noktalarının doğru konumda olup olmadığını
kontrol edin.

## ✅ Checklist

- [ ] Node.js kurulu (v18+)
- [ ] `npm install` çalıştırıldı
- [ ] `.env` dosyası düzenlendi (Telegram token)
- [ ] `config/streams.json` güncellendi
- [ ] `node test.js` ile test yapıldı
- [ ] SMPTE renkleri doğru tespit edildi
- [ ] `npm start` ile sistem başlatıldı
- [ ] Telegram bildirimleri geliyor

## 🎉 Başarılı Kurulum Sonrası

Sistem artık 7/24 çalışarak:
- Her 60 saniyede tüm yayınları kontrol eder
- Hata tespit ederse Telegram'a bildirim gönderir
- Detaylı loglar tutar
- Makina bazlı raporlama yapar

**Sistem durdurmak için:** `CTRL + C`

**Sistemi arkaplanda çalıştırmak için:**
```cmd
# Windows'ta Task Scheduler kullanabilirsiniz
# Veya pm2 kurabilirsiniz:
npm install -g pm2
pm2 start index.js --name broadcast-monitor
pm2 logs
```

---

**Destek için log dosyalarını (`logs/`) gönderin!**
