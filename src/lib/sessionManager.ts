'use client'

// Global session manager to prevent authentication issues
class SessionManager {
  private static instance: SessionManager
  private sessionCheckInterval: NodeJS.Timeout | null = null
  private isChecking = false

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  startSessionMonitoring() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
    }

    this.sessionCheckInterval = setInterval(() => {
      this.checkAndRestoreSession()
    }, 1000) // Check every second

    console.log('SessionManager: Started monitoring')
  }

  stopSessionMonitoring() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
      this.sessionCheckInterval = null
    }
    console.log('SessionManager: Stopped monitoring')
  }

  private async checkAndRestoreSession() {
    if (this.isChecking || typeof window === 'undefined') return

    this.isChecking = true

    try {
      // Check if user data exists in localStorage
      const userData = localStorage.getItem('user')
      const sessionTimestamp = localStorage.getItem('session_timestamp')

      if (!userData || !sessionTimestamp) {
        // Try to restore from backups
        const backupData = sessionStorage.getItem('user_backup') || 
                          localStorage.getItem('user_data_backup')

        if (backupData) {
          console.log('SessionManager: Restoring session from backup')
          localStorage.setItem('user', backupData)
          localStorage.setItem('session_timestamp', Date.now().toString())
          
          // Trigger a custom event to notify AuthContext
          window.dispatchEvent(new CustomEvent('sessionRestored', { 
            detail: { userData: JSON.parse(backupData) } 
          }))
        }
      }

      // Check session age (24 hours max)
      if (sessionTimestamp) {
        const sessionAge = Date.now() - parseInt(sessionTimestamp)
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours

        if (sessionAge > maxAge) {
          console.log('SessionManager: Session expired, clearing data')
          this.clearSession()
        }
      }
    } catch (error) {
      console.warn('SessionManager: Error checking session:', error)
    } finally {
      this.isChecking = false
    }
  }

  clearSession() {
    if (typeof window === 'undefined') return

    localStorage.removeItem('user')
    localStorage.removeItem('session_timestamp')
    sessionStorage.removeItem('user_backup')
    localStorage.removeItem('user_data_backup')
    localStorage.removeItem('user_id_backup')
    localStorage.removeItem('user_email_backup')

    // Trigger logout event
    window.dispatchEvent(new CustomEvent('sessionCleared'))
  }

  storeSession(userData: any) {
    if (typeof window === 'undefined') return

    const userDataString = JSON.stringify(userData)
    const timestamp = Date.now().toString()

    // Store in multiple locations
    localStorage.setItem('user', userDataString)
    localStorage.setItem('session_timestamp', timestamp)
    sessionStorage.setItem('user_backup', userDataString)
    localStorage.setItem('user_data_backup', userDataString)
    localStorage.setItem('user_id_backup', userData.id)
    localStorage.setItem('user_email_backup', userData.email)

    console.log('SessionManager: Session stored successfully')
  }
}

export const sessionManager = SessionManager.getInstance()
