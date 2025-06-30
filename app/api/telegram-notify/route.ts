import { NextRequest, NextResponse } from 'next/server'

// Telegram API endpoint
const TELEGRAM_API_URL = 'https://api.telegram.org'

// Internal secret to validate requests
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || '9c8787ef817658f5e76fa0e282240072c0be9c6edd1178270fff0c57c2a6252e'

export async function POST(request: NextRequest) {
  try {
    // Get environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'Telegram credentials not configured' },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    // Validate internal secret
    if (body.secret !== INTERNAL_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Extract user data
    const { type, userData } = body

    if (type !== 'new_signup') {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      )
    }

    // Format the message
    const message = formatNewUserMessage(userData)

    // Send to Telegram
    const telegramUrl = `${TELEGRAM_API_URL}/bot${botToken}/sendMessage`
    
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
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Telegram API error:', error)
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function formatNewUserMessage(userData: any): string {
  const { email, displayName, signupTime } = userData
  
  // Format signup time
  const date = new Date(signupTime)
  const formattedDate = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return `🎉 <b>New User Signup!</b>

📧 <b>Email:</b> ${email || 'N/A'}
👤 <b>Name:</b> ${displayName || 'Not provided'}
📅 <b>Signup:</b> ${formattedDate}
🎁 <b>Initial Quota:</b> 50 quotes
📱 <b>Platform:</b> Insurance Advisor Pro`
}