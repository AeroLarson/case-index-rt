// Payment Tracking Service
import { databasePaymentTracker } from './databasePaymentTracker'

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
  static async addPaymentRecord(record: Omit<PaymentRecord, 'id' | 'paymentDate'>): Promise<PaymentRecord> {
    try {
      const newRecord = await databasePaymentTracker.addPaymentRecord({
        userId: record.userId,
        userEmail: record.userEmail,
        userName: record.userName,
        planId: record.planId,
        amount: record.amount,
        status: record.status,
        stripeSessionId: record.stripeSessionId,
        stripePaymentId: record.stripeCustomerId,
        nextBillingDate: record.nextBillingDate ? new Date(record.nextBillingDate) : undefined,
        notes: record.notes
      })
      
      return {
        id: newRecord.id,
        userId: newRecord.userId,
        userEmail: newRecord.userEmail,
        userName: newRecord.userName,
        planId: newRecord.planId as 'pro' | 'team',
        amount: newRecord.amount,
        status: newRecord.status as 'pending' | 'completed' | 'failed' | 'refunded',
        stripeSessionId: newRecord.stripeSessionId,
        stripeCustomerId: newRecord.stripePaymentId,
        paymentDate: newRecord.createdAt.toISOString(),
        nextBillingDate: newRecord.nextBillingDate?.toISOString(),
        notes: newRecord.notes
      }
    } catch (error) {
      console.error('Error adding payment record:', error)
      throw error
    }
  }

  static async getAllPayments(): Promise<PaymentRecord[]> {
    try {
      const payments = await databasePaymentTracker.getAllPayments()
      return payments.map(payment => ({
        id: payment.id,
        userId: payment.userId,
        userEmail: payment.userEmail,
        userName: payment.userName,
        planId: payment.planId as 'pro' | 'team',
        amount: payment.amount,
        status: payment.status as 'pending' | 'completed' | 'failed' | 'refunded',
        stripeSessionId: payment.stripeSessionId,
        stripeCustomerId: payment.stripePaymentId,
        paymentDate: payment.createdAt.toISOString(),
        nextBillingDate: payment.nextBillingDate?.toISOString(),
        notes: payment.notes
      }))
    } catch (error) {
      console.error('Error getting all payments:', error)
      return []
    }
  }

  static async getPaymentsByUser(userId: string): Promise<PaymentRecord[]> {
    try {
      const payments = await databasePaymentTracker.getPaymentsByUser(userId)
      return payments.map(payment => ({
        id: payment.id,
        userId: payment.userId,
        userEmail: payment.userEmail,
        userName: payment.userName,
        planId: payment.planId as 'pro' | 'team',
        amount: payment.amount,
        status: payment.status as 'pending' | 'completed' | 'failed' | 'refunded',
        stripeSessionId: payment.stripeSessionId,
        stripeCustomerId: payment.stripePaymentId,
        paymentDate: payment.createdAt.toISOString(),
        nextBillingDate: payment.nextBillingDate?.toISOString(),
        notes: payment.notes
      }))
    } catch (error) {
      console.error('Error getting user payments:', error)
      return []
    }
  }

  static async updatePaymentStatus(paymentId: string, status: PaymentRecord['status'], notes?: string): Promise<void> {
    try {
      await databasePaymentTracker.updatePaymentStatus(paymentId, status, notes)
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw error
    }
  }

  static async getPaymentStats() {
    try {
      return await databasePaymentTracker.getPaymentStats()
    } catch (error) {
      console.error('Error getting payment stats:', error)
      return {
        totalPayments: 0,
        totalRevenue: 0,
        monthlyRevenue: 0
      }
    }
  }

  static async clearAllPayments(): Promise<void> {
    try {
      await databasePaymentTracker.clearAllPayments()
    } catch (error) {
      console.error('Error clearing all payments:', error)
      throw error
    }
  }
}