import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      fullName, 
      email, 
      company, 
      phone, 
      teamSize, 
      timeline, 
      budgetRange, 
      additionalRequirements 
    } = body

    // Validate required fields
    if (!fullName || !email || !company || !teamSize || !timeline || !budgetRange) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create email transporter
    const transporter = nodemailer.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL || 'caseindexrt@gmail.com',
        pass: process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD
      }
    })

    // Email content
    const emailContent = `
New Contact Request from Case Index RT Website

Contact Information:
- Name: ${fullName}
- Email: ${email}
- Company: ${company}
- Phone: ${phone || 'Not provided'}

Requirements:
- Team Size: ${teamSize}
- Timeline: ${timeline}
- Budget Range: ${budgetRange}

Additional Requirements:
${additionalRequirements || 'None provided'}

---
This email was sent from the Case Index RT contact form.
    `

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL || 'caseindexrt@gmail.com',
      to: 'caseindexrt@gmail.com',
      subject: `New Contact Request from ${fullName} - ${company}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    })

    return NextResponse.json({
      success: true,
      message: 'Contact request sent successfully'
    })

  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send contact request',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
