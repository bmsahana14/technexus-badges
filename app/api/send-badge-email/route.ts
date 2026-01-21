import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      to_email,
      badge_name,
      event_name,
      badge_link
    } = body

    // Validate required fields
    if (!to_email || !badge_name || !event_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
    const badgeUrl = badge_link || `${appUrl}/dashboard`

    // Send email
    console.log('Attempting to send email to:', to_email)
    const { data, error } = await resend.emails.send({
      from: 'TechNexus Community <onboarding@resend.dev>',
      to: to_email,
      subject: `🎉 You've Earned a TechNexus Community Badge: ${badge_name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TechNexus Community - New Badge</title>
          </head>
          <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f0f9ff; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%); padding: 40px 30px; text-align: center;">
                <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                  <span style="font-size: 48px;">🏆</span>
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Congratulations!</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">New TechNexus Community Achievement</p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px;">
                <div style="background-color: #f0f9ff; border-left: 4px solid #1890ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                  <h2 style="color: #1a237e; margin: 0 0 10px 0; font-size: 22px;">${badge_name}</h2>
                  <p style="color: #64748b; margin: 0; font-size: 14px;">
                    <strong>Event:</strong> ${event_name}
                  </p>
                </div>

                <p style="color: #475569; line-height: 1.6; margin-bottom: 30px;">
                  We're excited to inform you that you've successfully earned a new digital badge from the TechNexus Community! 
                  Click the button below to view your achievement and add it to your secure collection.
                </p>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${badgeUrl}" style="display: inline-block; background-color: #1890ff; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(24, 144, 255, 0.3);">
                    View Your Achievement
                  </a>
                </div>

                <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 30px;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${badgeUrl}" style="color: #1890ff; word-break: break-all;">${badgeUrl}</a>
                </p>
              </div>

              <!-- Footer -->
              <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                  <strong>TechNexus Community</strong>
                </p>
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  © 2026 TechNexus Community. All rights reserved.
                </p>
              </div>

            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend Error Details:', error)
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      )
    }

    console.log('Email sent successfully:', data)
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data
    })

  } catch (error: any) {
    console.error('Email API API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
