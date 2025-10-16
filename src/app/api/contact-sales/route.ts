import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'email', 'company', 'teamSize']
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
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

    // Email content for sales team
    const salesEmailContent = `
New Sales Inquiry from Case Index RT Website

Contact Information:
- Name: ${formData.name}
- Email: ${formData.email}
- Company: ${formData.company}
- Phone: ${formData.phone || 'Not provided'}

Requirements:
- Team Size: ${formData.teamSize}
- Current Plan Interest: ${formData.currentPlan}
- Timeline: ${formData.timeframe || 'Not specified'}
- Budget: ${formData.budget || 'Not specified'}

Message:
${formData.message || 'No additional message provided'}

---
This inquiry was submitted through the Case Index RT contact form.
Timestamp: ${new Date().toISOString()}
    `

    // Send email to sales team
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL || 'caseindexrt@gmail.com',
      to: 'caseindexrt@gmail.com',
      subject: `New Sales Inquiry from ${formData.name} - ${formData.company}`,
      text: salesEmailContent,
      html: salesEmailContent.replace(/\n/g, '<br>')
    })

    // Send confirmation email to customer
    const confirmationEmailContent = `
Dear ${formData.name},

Thank you for your interest in Case Index RT! We've received your inquiry and our sales team will be in touch within 24 hours.

Your inquiry details:
- Company: ${formData.company}
- Team Size: ${formData.teamSize}
- Plan Interest: ${formData.currentPlan}
- Timeline: ${formData.timeframe || 'Not specified'}

If you have any immediate questions, please don't hesitate to contact us at caseindexrt@gmail.com.

Best regards,
The Case Index RT Team
    `

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL || 'caseindexrt@gmail.com',
      to: formData.email,
      subject: 'Thank you for your interest in Case Index RT',
      text: confirmationEmailContent,
      html: confirmationEmailContent.replace(/\n/g, '<br>')
    })

    console.log('Sales inquiry processed and emails sent:', {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Sales inquiry submitted successfully. You will receive a confirmation email shortly.',
      leadId: `LEAD-${Date.now()}`,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error processing sales inquiry:', error)
    return NextResponse.json(
      { 
        error: 'Failed to submit sales inquiry',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
