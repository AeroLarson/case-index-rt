import { NextRequest, NextResponse } from 'next/server'

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

    // In a real app, this would:
    // 1. Save to your CRM/database
    // 2. Send notification emails
    // 3. Create a lead in your sales pipeline
    // 4. Integrate with tools like HubSpot, Salesforce, etc.

    console.log('New sales inquiry received:', {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      teamSize: formData.teamSize,
      plan: formData.currentPlan,
      timeline: formData.timeframe,
      budget: formData.budget,
      message: formData.message,
      timestamp: new Date().toISOString()
    })

    // Simulate sending notification emails
    // await sendSalesNotification(formData)
    // await sendConfirmationEmail(formData.email, formData.name)

    return NextResponse.json({
      success: true,
      message: 'Sales inquiry submitted successfully',
      leadId: `LEAD-${Date.now()}`, // In real app, this would be from your CRM
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error processing sales inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to submit sales inquiry' },
      { status: 500 }
    )
  }
}

// Helper function to send sales notification (implement with your email service)
async function sendSalesNotification(formData: any) {
  // Implementation would depend on your email service (SendGrid, Resend, etc.)
  console.log('Sending sales notification for:', formData.name)
}

// Helper function to send confirmation email to customer
async function sendConfirmationEmail(email: string, name: string) {
  // Implementation would depend on your email service
  console.log('Sending confirmation email to:', email)
}
