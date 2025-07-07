const QRCode = require('qrcode');

class QRService {
  async generateQRCode(data) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  async generateQRCodeBuffer(data) {
    try {
      const buffer = await QRCode.toBuffer(data, {
        errorCorrectionLevel: 'M',
        type: 'png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      
      return buffer;
    } catch (error) {
      console.error('QR Code buffer generation error:', error);
      throw new Error('Failed to generate QR code buffer');
    }
  }
}

module.exports = new QRService();