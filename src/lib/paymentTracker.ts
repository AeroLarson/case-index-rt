// Payment Tracking Service
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
  private static getStorageKey() {
    return 'payment_records'
  }

  static addPaymentRecord(record: Omit<PaymentRecord, 'id' | 'paymentDate'>): PaymentRecord {
    const paymentRecord: PaymentRecord = {
      ...record,
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentDate: new Date().toISOString()
    }

    const records = this.getAllPayments()
    records.push(paymentRecord)
    localStorage.setItem(this.getStorageKey(), JSON.stringify(records))
    
    return paymentRecord
  }

  static getAllPayments(): PaymentRecord[] {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(this.getStorageKey())
    return stored ? JSON.parse(stored) : []
  }

  static getPaymentsByUser(userId: string): PaymentRecord[] {
    return this.getAllPayments().filter(payment => payment.userId === userId)
  }

  static updatePaymentStatus(paymentId: string, status: PaymentRecord['status'], notes?: string): void {
    const records = this.getAllPayments()
    const record = records.find(r => r.id === paymentId)
    
    if (record) {
      record.status = status
      if (notes) record.notes = notes
      localStorage.setItem(this.getStorageKey(), JSON.stringify(records))
    }
  }

  static getPaymentStats() {
    const payments = this.getAllPayments()
    const completedPayments = payments.filter(p => p.status === 'completed')
    
    // Exclude admin account from revenue calculations
    const adminEmail = 'aero.larson@gmail.com'
    const nonAdminCompletedPayments = completedPayments.filter(p => p.userEmail !== adminEmail)
    
    return {
      totalPayments: payments.length,
      completedPayments: completedPayments.length,
      totalRevenue: nonAdminCompletedPayments.reduce((sum, p) => sum + p.amount, 0),
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      failedPayments: payments.filter(p => p.status === 'failed').length,
      proSubscriptions: nonAdminCompletedPayments.filter(p => p.planId === 'pro').length,
      teamSubscriptions: nonAdminCompletedPayments.filter(p => p.planId === 'team').length,
      recentPayments: payments
        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
        .slice(0, 10)
    }
  }

  static clearAllPayments(): void {
    localStorage.removeItem(this.getStorageKey())
  }
}

