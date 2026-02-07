const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.logFile = path.join(this.logDir, `monitor-${this.getDateString()}.log`);
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  getTimestamp() {
    const now = new Date();
    return now.toISOString();
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      logMessage += '\n' + JSON.stringify(data, null, 2);
    }
    
    return logMessage;
  }

  writeToFile(message) {
    try {
      fs.appendFileSync(this.logFile, message + '\n', 'utf8');
    } catch (error) {
      console.error('Log dosyasına yazılamadı:', error.message);
    }
  }

  info(message, data = null) {
    const formattedMessage = this.formatMessage('info', message, data);
    console.log('\x1b[36m%s\x1b[0m', formattedMessage); // Cyan
    this.writeToFile(formattedMessage);
  }

  success(message, data = null) {
    const formattedMessage = this.formatMessage('success', message, data);
    console.log('\x1b[32m%s\x1b[0m', formattedMessage); // Green
    this.writeToFile(formattedMessage);
  }

  warning(message, data = null) {
    const formattedMessage = this.formatMessage('warning', message, data);
    console.log('\x1b[33m%s\x1b[0m', formattedMessage); // Yellow
    this.writeToFile(formattedMessage);
  }

  error(message, data = null) {
    const formattedMessage = this.formatMessage('error', message, data);
    console.log('\x1b[31m%s\x1b[0m', formattedMessage); // Red
    this.writeToFile(formattedMessage);
  }

  debug(message, data = null) {
    if (process.env.DEBUG_MODE === 'true') {
      const formattedMessage = this.formatMessage('debug', message, data);
      console.log('\x1b[35m%s\x1b[0m', formattedMessage); // Magenta
      this.writeToFile(formattedMessage);
    }
  }

  separator() {
    const line = '='.repeat(80);
    console.log(line);
    this.writeToFile(line);
  }
}

module.exports = new Logger();
