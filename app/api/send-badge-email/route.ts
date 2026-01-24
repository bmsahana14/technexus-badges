import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      to_email,
      badge_name,
      event_name,
      badge_link
    } = body

    const BREVO_API_KEY = process.env.BREVO_API_KEY

    // Validate required fields
    if (!to_email || !badge_name || !event_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!BREVO_API_KEY) {
      console.error('BREVO_API_KEY is missing')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const host = request.headers.get('host')
    const protocol = host?.includes('localhost') ? 'http' : 'https'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`
    const badge_id = body.badge_id
    const badgeUrl = badge_id ? `${appUrl}/dashboard/badge/${badge_id}` : `${appUrl}/dashboard`
    const isNewUser = body.is_new_user === true

    // Send email via Brevo REST API
    console.log('Attempting to send Brevo email to:', to_email)

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'TechNexus Community',
          email: 'bmsahana14@gmail.com' // Should be your verified Brevo sender
        },
        to: [{ email: to_email }],
        replyTo: { email: 'bmsahana14@gmail.com' },
        subject: isNewUser
          ? `🎁 A TechNexus Badge is Waiting for You: ${badge_name}`
          : `🎉 You've Earned a TechNexus Community Badge: ${badge_name}`,
        textContent: `
          ${isNewUser ? 'Welcome to TechNexus!' : 'Congratulations!'}
          
          ${isNewUser
            ? "Someone issued an achievement badge to your email. Sign up now to claim your credential!"
            : "You've earned a new digital badge from the TechNexus Community."}
          
          Badge: ${badge_name}
          Event: ${event_name}
          
          Claim/View your badge here: ${isNewUser ? `${appUrl}/auth/signup` : badgeUrl}
          
          Sent via TechNexus Community Credential Service
        `.trim(),
        htmlContent: `
          <!DOCTYPE html>
          <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
            <head>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <!--[if mso]>
              <xml>
                <o:OfficeDocumentSettings>
                  <o:AllowPNG/>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
              </xml>
              <![endif]-->
              <style>
                body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; height: 100% !important;}
                table { border-spacing: 0; border-collapse: collapse; }
                img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
              </style>
            </head>
            <body style="font-family: Arial, Helvetica, sans-serif; background-color: #f0f9ff; padding: 20px; margin: 0;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f0f9ff">
                <tr>
                  <td align="center">
                    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; text-align: center; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                      <h1 style="color: #1a237e; margin-bottom: 8px;">${isNewUser ? 'Welcome to TechNexus!' : 'Congratulations!'}</h1>
                      <p style="color: #64748b; font-size: 18px; line-height: 1.6;">
                        ${isNewUser
            ? "Someone issued an achievement badge to your email. Sign up now to claim your credential and join our community!"
            : "You've earned a new digital badge from the TechNexus Community."}
                      </p>
                      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #1890ff; text-align: left;">
                        <h2 style="margin: 0; color: #1890ff;">${badge_name}</h2>
                        <p style="margin: 5px 0 0 0; color: #475569;">Event: ${event_name}</p>
                      </div>
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${isNewUser ? `${appUrl}/auth/signup` : badgeUrl}" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="16%" stroke="f" fillcolor="#1890ff">
                        <w:anchorlock/>
                        <center>
                      <![endif]-->
                      <a href="${isNewUser ? `${appUrl}/auth/signup` : badgeUrl}" style="display: inline-block; background: #1890ff; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        ${isNewUser ? 'Join & Claim Badge' : 'View Badge Details'}
                      </a>
                      <!--[if mso]>
                        </center>
                      </v:roundrect>
                      <![endif]-->
                      ${isNewUser ? `
                        <p style="color: #94a3b8; font-size: 14px; margin-top: 20px;">
                          Note: Please use this email address (${to_email}) when signing up to automatically see your badge.
                        </p>
                      ` : ''}
                      <hr style="margin-top: 40px; border: 0; border-top: 1px solid #e2e8f0;">
                      <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
                        Sent via TechNexus Community Credential Service
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Brevo API Error:', data)
      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: data,
          message: data.message || 'Check your Brevo API key and sender email.'
        },
        { status: response.status }
      )
    }

    console.log('Brevo Email Success:', data)
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully via Brevo',
      data
    })

  } catch (error: any) {
    console.error('Brevo API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
