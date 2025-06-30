const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Initialize Firebase Admin
admin.initializeApp();

// Telegram API configuration
const TELEGRAM_API_URL = 'https://api.telegram.org';

// Helper function to format new user message
function formatNewUserMessage(userData) {
  const { email, displayName, signupTime } = userData;
  
  // Format signup time
  const date = new Date(signupTime);
  const formattedDate = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `🎉 <b>New User Signup!</b>

📧 <b>Email:</b> ${email || 'N/A'}
👤 <b>Name:</b> ${displayName || 'Not provided'}
📅 <b>Signup:</b> ${formattedDate}
🎁 <b>Initial Quota:</b> 50 quotes
📱 <b>Platform:</b> Insurance Advisor Pro`;
}

// Optional: Function to handle new user creation directly from Firestore
exports.onNewUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const userId = context.params.userId;
    
    // Only send notification for new users (not updates)
    if (!userData.createdAt) {
      return null;
    }
    
    try {
      // Get Telegram credentials from environment config
      const botToken = functions.config().telegram?.bot_token;
      const chatId = functions.config().telegram?.chat_id;

      if (!botToken || !chatId) {
        console.error('Telegram credentials not configured');
        return null;
      }

      // Format the message
      const message = formatNewUserMessage({
        email: userData.email,
        displayName: userData.displayName,
        signupTime: userData.createdAt.toDate().toISOString(),
      });

      // Send to Telegram
      const telegramUrl = `${TELEGRAM_API_URL}/bot${botToken}/sendMessage`;
      
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Telegram API error:', error);
      }

      return null;
    } catch (error) {
      console.error('Error sending Telegram notification for new user:', error);
      return null;
    }
  });

