const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');

// Initialize Firebase Admin
admin.initializeApp();

// Telegram API configuration
const TELEGRAM_API_URL = 'https://api.telegram.org';

// Helper function to verify Firebase Auth token
async function verifyAuthToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid auth token provided');
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid auth token');
  }
}

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

// Main Telegram notification function
exports.sendTelegramNotification = functions.https.onRequest((req, res) => {
  // Handle CORS
  return cors(req, res, async () => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      // Verify authentication
      const decodedToken = await verifyAuthToken(req);
      
      // Get Telegram credentials from environment config
      const botToken = functions.config().telegram?.bot_token;
      const chatId = functions.config().telegram?.chat_id;

      if (!botToken || !chatId) {
        console.error('Telegram credentials not configured');
        res.status(500).json({ error: 'Telegram credentials not configured' });
        return;
      }

      // Parse request body
      const { type, userData } = req.body;

      if (type !== 'new_signup') {
        res.status(400).json({ error: 'Invalid notification type' });
        return;
      }

      // Validate user data
      if (!userData || !userData.email) {
        res.status(400).json({ error: 'Invalid user data' });
        return;
      }

      // Format the message
      const message = formatNewUserMessage(userData);

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
        res.status(500).json({ error: 'Failed to send notification' });
        return;
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error in sendTelegramNotification:', error);
      
      // Handle specific error types
      if (error.message === 'No valid auth token provided' || error.message === 'Invalid auth token') {
        res.status(401).json({ error: 'Unauthorized' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });
});

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

// Health check endpoint
exports.healthCheck = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    res.status(200).json({ 
      status: 'healthy',
      service: 'telegram-notifications',
      timestamp: new Date().toISOString()
    });
  });
});