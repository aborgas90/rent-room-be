// services/twilioService.js
const twilio = require("twilio");
require("dotenv").config();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  TWILIO_WHATSAPP_NUMBER,
} = process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const TwilioService = {
  /**
   * Send SMS
   * @param {string} to - Recipient phone number (e.g. +628123456789)
   * @param {string} message - Text message content
   */
  sendSMS: async (to, message) => {
    try {
      const result = await client.messages.create({
        body: message,
        from: TWILIO_PHONE_NUMBER,
        to,
      });
      console.log("✅ SMS sent:", result.sid);
      return result;
    } catch (error) {
      console.error("❌ Failed to send SMS:", error.message);
      throw error;
    }
  },

  /**
   * Send WhatsApp Message
   * @param {string} to - Recipient phone number (e.g. whatsapp:+628123456789)
   * @param {string} message - WhatsApp message content
   */
  sendWhatsApp: async (to, message) => {
    try {
      const result = await client.messages.create({
        body: message,
        from: TWILIO_WHATSAPP_NUMBER,
        to,
      });
      console.log("✅ WhatsApp sent:", result.sid);
      return result;
    } catch (error) {
      console.error("❌ Failed to send WhatsApp:", error.message);
      throw error;
    }
  },
};

module.exports = TwilioService;
