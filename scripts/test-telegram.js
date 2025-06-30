#!/usr/bin/env node

/**
 * Test Telegram bot notifications
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const TELEGRAM_API_URL = 'https://api.telegram.org';
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

async function sendTestMessage() {
  if (!botToken || !chatId) {
    console.error('❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env.local');
    return;
  }

  console.log('🔍 Bot Token:', botToken);
  console.log('🔍 Chat ID:', chatId);

  const message = `🧪 <b>Test Message</b>\n\nThis is a test message from your AIA Insurance Advisor bot.\n\nTimestamp: ${new Date().toLocaleString()}`;

  try {
    const telegramUrl = `${TELEGRAM_API_URL}/bot${botToken}/sendMessage`;
    console.log('\n📤 Sending message to:', telegramUrl);

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.ok) {
      console.log('✅ Message sent successfully!');
      console.log('📨 Message ID:', data.result.message_id);
    } else {
      console.error('❌ Failed to send message:', data);
    }
  } catch (error) {
    console.error('❌ Error sending message:', error);
  }
}

// Run the test
sendTestMessage();