// Payment Tracking Service - localStorage based

export interface PaymentRecord {
  id: string
  userId: string
  userEmail: string
  userName: string
  planId: 'pro' | 'team'
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  stripeSessionId?: string
  stripeCustomerId?: string
  paymentDate: string
  nextBillingDate?: string
  notes?: string
}

export class PaymentTracker {
  static addPaymentRecord(record: Omit<PaymentRecord, 'id' | 'paymentDate'>): PaymentRecord {
    try {
      const newRecord: PaymentRecord = {
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: record.userId,
        userEmail: record.userEmail,
        userName: record.userName,
        planId: record.planId,
        amount: record.amount,
        status: record.status,
        stripeSessionId: record.stripeSessionId,
        stripeCustomerId: record.stripeCustomerId,
        paymentDate: new Date().toISOString(),
        nextBillingDate: record.nextBillingDate,
        notes: record.notes
      }
      
      // Store in localStorage
      const existingPayments = this.getAllPayments()
      existingPayments.push(newRecord)
      localStorage.setItem('payment_records', JSON.stringify(existingPayments))
      
      return newRecord
    } catch (error) {
      console.error('Error adding payment record:', error)
      throw error
    }
  }

  static getAllPayments(): PaymentRecord[] {
    try {
      const payments = localStorage.getItem('payment_records')
      return payments ? JSON.parse(payments) : []
    } catch (error) {
      console.error('Error getting all payments:', error)
      return []
    }
  }

  static getPaymentsByUser(userId: string): PaymentRecord[] {
    try {
      const allPayments = this.getAllPayments()
      return allPayments.filter(payment => payment.userId === userId)
    } catch (error) {
      console.error('Error getting user payments:', error)
      return []
    }
  }

  static updatePaymentStatus(paymentId: string, status: PaymentRecord['status'], notes?: string): void {
    try {
      const payments = this.getAllPayments()
      const paymentIndex = payments.findIndex(p => p.id === paymentId)
      if (paymentIndex !== -1) {
        payments[paymentIndex].status = status
        if (notes) payments[paymentIndex].notes = notes
        localStorage.setItem('payment_records', JSON.stringify(payments))
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw error
    }
  }

  static getPaymentStats() {
    try {
      const ADMIN_EMAIL = 'aero.larson@gmail.com'
      // Exclude admin payments from stats
      const payments = this.getAllPayments().filter(p => p.userEmail !== ADMIN_EMAIL)
      const completedPayments = payments.filter(p => p.status === 'completed')
      const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)
      
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlyRevenue = completedPayments
        .filter(p => {
          const paymentDate = new Date(p.paymentDate)
          return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
        })
        .reduce((sum, p) => sum + p.amount, 0)
      
      return {
        totalPayments: payments.length,
        completedPayments: completedPayments.length,
        totalRevenue,
        monthlyRevenue,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        failedPayments: payments.filter(p => p.status === 'failed').length,
        proSubscriptions: payments.filter(p => p.planId === 'pro' && p.status === 'completed').length,
        teamSubscriptions: payments.filter(p => p.planId === 'team' && p.status === 'completed').length,
        recentPayments: payments.slice(-10).reverse()
      }
    } catch (error) {
      console.error('Error getting payment stats:', error)
      return {
        totalPayments: 0,
        completedPayments: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingPayments: 0,
        failedPayments: 0,
        proSubscriptions: 0,
        teamSubscriptions: 0,
        recentPayments: []
      }
    }
  }

  static clearAllPayments(): void {
    try {
      localStorage.removeItem('payment_records')
    } catch (error) {
      console.error('Error clearing all payments:', error)
      throw error
    }
  }
}