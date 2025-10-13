import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendPasswordResetEmailParams {
  email: string
  name: string
  resetToken: string
}

export async function sendPasswordResetEmail({ email, name, resetToken }: SendPasswordResetEmailParams) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Case Index RT <noreply@caseindexrt.com>',
      to: [email],
      subject: 'Reset Your Password - Case Index RT',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                          🔐 Password Reset Request
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
                          Hi ${name || 'there'},
                        </p>
                        <p style="margin: 0 0 20px; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                          We received a request to reset your password for your Case Index RT account. Click the button below to create a new password:
                        </p>
                        
                        <!-- Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 20px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="margin: 10px 0 20px; color: #60a5fa; font-size: 14px; word-break: break-all;">
                          ${resetUrl}
                        </p>
                        
                        <div style="margin: 30px 0; padding: 20px; background-color: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; border-radius: 8px;">
                          <p style="margin: 0; color: #fca5a5; font-size: 14px; line-height: 1.6;">
                            <strong>⚠️ Security Notice:</strong><br>
                            This link will expire in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                          </p>
                        </div>
                        
                        <p style="margin: 20px 0 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                          Best regards,<br>
                          <strong style="color: #e2e8f0;">The Case Index RT Team</strong>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; background-color: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(148, 163, 184, 0.1);">
                        <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center; line-height: 1.6;">
                          Case Index RT - Legal Case Management Platform<br>
                          © ${new Date().getFullYear()} All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending password reset email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error }
  }
}

interface SendWelcomeEmailParams {
  email: string
  name: string
}

export async function sendWelcomeEmail({ email, name }: SendWelcomeEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Case Index RT <noreply@caseindexrt.com>',
      to: [email],
      subject: 'Welcome to Case Index RT! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Case Index RT</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);">
                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                          Welcome to Case Index RT! 🎉
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 18px; line-height: 1.6;">
                          Hi ${name || 'there'},
                        </p>
                        <p style="margin: 0 0 20px; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                          Thank you for joining <strong style="color: #60a5fa;">Case Index RT</strong> - your AI-powered legal case management platform!
                        </p>
                        
                        <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border-radius: 12px; border: 1px solid rgba(96, 165, 250, 0.2);">
                          <h2 style="margin: 0 0 15px; color: #e2e8f0; font-size: 20px; font-weight: 600;">
                            🚀 Getting Started
                          </h2>
                          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 15px; line-height: 1.8;">
                            <li>Search California court cases with AI precision</li>
                            <li>Track hearings and deadlines automatically</li>
                            <li>Save and organize your cases</li>
                            <li>Get AI-powered case insights</li>
                          </ul>
                        </div>
                        
                        <!-- Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="${process.env.NEXTAUTH_URL}/login" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);">
                                Get Started Now
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 20px 0 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                          If you have any questions, feel free to reach out to our support team.
                        </p>
                        
                        <p style="margin: 20px 0 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                          Best regards,<br>
                          <strong style="color: #e2e8f0;">The Case Index RT Team</strong>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; background-color: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(148, 163, 184, 0.1);">
                        <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center; line-height: 1.6;">
                          Case Index RT - Legal Case Management Platform<br>
                          © ${new Date().getFullYear()} All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}


