// PDF Invoice Generator
import jsPDF from 'jspdf'

export interface InvoiceData {
  invoiceNumber: string
  date: string
  customerName: string
  customerEmail: string
  planName: string
  amount: number
  status: string
  stripeSessionId?: string
  nextBillingDate?: string
}

export class InvoiceGenerator {
  static generateInvoice(data: InvoiceData): void {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Colors
    const primaryColor = '#8B5CF6' // Purple
    const secondaryColor = '#1A0B2E' // Dark purple
    const textColor = '#374151' // Gray
    const lightGray = '#9CA3AF'
    
    // Header
    doc.setFillColor(139, 92, 246) // Purple background
    doc.rect(0, 0, pageWidth, 40, 'F')
    
    // Company Logo/Name
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Case Index RT', 20, 25)
    
    // Invoice title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'normal')
    doc.text('INVOICE', pageWidth - 60, 25)
    
    // Invoice details box
    doc.setFillColor(248, 250, 252) // Light gray background
    doc.rect(20, 50, pageWidth - 40, 60, 'F')
    doc.setDrawColor(229, 231, 235) // Light border
    doc.rect(20, 50, pageWidth - 40, 60, 'S')
    
    // Invoice number and date
    doc.setTextColor(textColor)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Invoice #:', 30, 70)
    doc.setFont('helvetica', 'normal')
    doc.text(data.invoiceNumber, 80, 70)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Date:', 30, 80)
    doc.setFont('helvetica', 'normal')
    doc.text(data.date, 80, 80)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Status:', 30, 90)
    doc.setFont('helvetica', 'normal')
    doc.text(data.status, 80, 90)
    
    // Customer information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(secondaryColor)
    doc.text('Bill To:', 30, 120)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(textColor)
    doc.text(data.customerName, 30, 135)
    doc.text(data.customerEmail, 30, 145)
    
    // Service details
    doc.setFillColor(248, 250, 252)
    doc.rect(20, 160, pageWidth - 40, 40, 'F')
    doc.setDrawColor(229, 231, 235)
    doc.rect(20, 160, pageWidth - 40, 40, 'S')
    
    // Service header
    doc.setFillColor(139, 92, 246)
    doc.rect(20, 160, pageWidth - 40, 15, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Service', 30, 172)
    doc.text('Amount', pageWidth - 60, 172)
    
    // Service details
    doc.setTextColor(textColor)
    doc.setFont('helvetica', 'normal')
    doc.text(`${data.planName} Plan`, 30, 185)
    doc.text(`$${data.amount.toFixed(2)}`, pageWidth - 60, 185)
    
    // Total
    doc.setFillColor(248, 250, 252)
    doc.rect(20, 200, pageWidth - 40, 25, 'F')
    doc.setDrawColor(229, 231, 235)
    doc.rect(20, 200, pageWidth - 40, 25, 'S')
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(secondaryColor)
    doc.text('Total:', pageWidth - 80, 218)
    doc.text(`$${data.amount.toFixed(2)}`, pageWidth - 40, 218)
    
    // Footer
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(lightGray)
    doc.text('Thank you for your business!', 20, pageHeight - 30)
    doc.text('Case Index RT - Legal Case Management Platform', 20, pageHeight - 20)
    
    if (data.stripeSessionId) {
      doc.text(`Payment ID: ${data.stripeSessionId}`, 20, pageHeight - 10)
    }
    
    // Download the PDF
    doc.save(`invoice-${data.invoiceNumber}.pdf`)
  }
  
  static generateInvoiceFromPayment(payment: any): InvoiceData {
    return {
      invoiceNumber: `INV-${payment.id.slice(-8).toUpperCase()}`,
      date: new Date(payment.paymentDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      customerName: payment.userName,
      customerEmail: payment.userEmail,
      planName: payment.planId === 'pro' ? 'Professional' : 'Team',
      amount: payment.amount,
      status: payment.status === 'completed' ? 'Paid' : 'Pending',
      stripeSessionId: payment.stripeSessionId,
      nextBillingDate: payment.nextBillingDate
    }
  }
}


