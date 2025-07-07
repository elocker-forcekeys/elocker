const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  initialize() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email service error:', error);
        } else {
          console.log('✅ Email service ready');
        }
      });

    } catch (error) {
      console.error('Email service initialization error:', error);
    }
  }

  async sendDeliveryNotification({ recipientEmail, recipientName, trackingNumber, pickupCode, qrCode, expiryDate }) {
    try {
      const mailOptions = {
        from: `"Smart Lockers" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: `Package Delivered - ${trackingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
              <h1>📦 Package Delivered!</h1>
            </div>
            
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Hello ${recipientName},</h2>
              <p>Your package has been successfully delivered to a Smart Locker!</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Pickup Information:</h3>
                <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                <p><strong>Pickup Code:</strong> <span style="font-size: 18px; font-weight: bold; color: #667eea;">${pickupCode}</span></p>
                <p><strong>Expires:</strong> ${new Date(expiryDate).toLocaleString()}</p>
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <h3>QR Code for Quick Pickup:</h3>
                <img src="${qrCode}" alt="QR Code" style="max-width: 200px; border: 1px solid #ddd; padding: 10px; background: white;">
              </div>
              
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4>How to pickup your package:</h4>
                <ol>
                  <li>Visit the Smart Locker location</li>
                  <li>Either scan the QR code above OR enter your tracking number and pickup code</li>
                  <li>The compartment will open automatically</li>
                  <li>Retrieve your package</li>
                </ol>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                If you have any issues, please contact our support team.
              </p>
            </div>
            
            <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
              <p>Smart Lockers System - Secure Package Delivery</p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Delivery notification sent:', result.messageId);
      return result;

    } catch (error) {
      console.error('❌ Failed to send delivery notification:', error);
      throw error;
    }
  }

  async sendPickupConfirmation({ recipientEmail, recipientName, trackingNumber }) {
    try {
      const mailOptions = {
        from: `"Smart Lockers" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: `Package Picked Up - ${trackingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 20px; text-align: center;">
              <h1>✅ Package Picked Up!</h1>
            </div>
            
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Hello ${recipientName},</h2>
              <p>Your package with tracking number <strong>${trackingNumber}</strong> has been successfully picked up.</p>
              
              <p>Thank you for using Smart Lockers!</p>
            </div>
            
            <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
              <p>Smart Lockers System - Secure Package Delivery</p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Pickup confirmation sent:', result.messageId);
      return result;

    } catch (error) {
      console.error('❌ Failed to send pickup confirmation:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();