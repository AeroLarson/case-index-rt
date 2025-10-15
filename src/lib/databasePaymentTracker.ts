import { prisma } from './database'

export interface PaymentRecord {
  id: string
  userId: string
  userEmail: string
  userName: string
  planId: string
  amount: number
  status: string
  stripeSessionId?: string
  stripePaymentId?: string
  nextBillingDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export class DatabasePaymentTracker {
  async addPaymentRecord(paymentData: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentRecord> {
    try {
      const payment = await prisma.payment.create({
        data: {
          userId: paymentData.userId,
          userEmail: paymentData.userEmail,
          userName: paymentData.userName,
          planId: paymentData.planId,
          amount: paymentData.amount,
          status: paymentData.status,
          stripeSessionId: paymentData.stripeSessionId,
          stripePaymentId: paymentData.stripePaymentId,
          nextBillingDate: paymentData.nextBillingDate,
          notes: paymentData.notes
        }
      })
      return payment as PaymentRecord
    } catch (error) {
      console.error('Error adding payment record:', error)
      throw error
    }
  }

  async getAllPayments(): Promise<PaymentRecord[]> {
    try {
      const payments = await prisma.payment.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return payments as PaymentRecord[]
    } catch (error) {
      console.error('Error getting all payments:', error)
      return []
    }
  }

  async getPaymentsByUser(userId: string): Promise<PaymentRecord[]> {
    try {
      const payments = await prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
      return payments as PaymentRecord[]
    } catch (error) {
      console.error('Error getting user payments:', error)
      return []
    }
  }

  async updatePaymentStatus(paymentId: string, status: string, notes?: string): Promise<void> {
    try {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status,
          notes: notes || undefined
        }
      })
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw error
    }
  }

  async getPaymentStats() {
    try {
      const totalPayments = await prisma.payment.count()
      const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' }
      })
      const monthlyRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'completed',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })

      return {
        totalPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        monthlyRevenue: monthlyRevenue._sum.amount || 0
      }
    } catch (error) {
      console.error('Error getting payment stats:', error)
      return {
        totalPayments: 0,
        totalRevenue: 0,
        monthlyRevenue: 0
      }
    }
  }

  async clearAllPayments(): Promise<void> {
    try {
      await prisma.payment.deleteMany({})
    } catch (error) {
      console.error('Error clearing all payments:', error)
      throw error
    }
  }
}

export const databasePaymentTracker = new DatabasePaymentTracker()
