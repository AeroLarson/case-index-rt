'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs or textareas
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Exception: allow '?' to show shortcuts modal even in inputs
        if (event.key !== '?' || !event.shiftKey) {
          return
        }
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.alt ? event.altKey : !event.altKey
        
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          event.preventDefault()
          shortcut.action()
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Global shortcuts hook - only enabled when user is logged in
export function useGlobalShortcuts() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in by checking localStorage
    const checkAuth = () => {
      if (typeof window === 'undefined') return false
      const savedUser = localStorage.getItem('user')
      return !!savedUser
    }

    if (!checkAuth()) {
      // Don't set up shortcuts if not logged in
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs or textareas
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Exception: allow '?' to show shortcuts modal even in inputs
        if (event.key !== '?' || !event.shiftKey) {
          return
        }
      }

      // Handle shortcuts
      const key = event.key.toLowerCase()
      
      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault()
        router.push('/search')
      } else if (key === '/' && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        event.preventDefault()
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        } else {
          router.push('/search')
        }
      } else if ((event.ctrlKey || event.metaKey) && key === 'n') {
        event.preventDefault()
        router.push('/search')
      } else if ((event.ctrlKey || event.metaKey) && key === 'd') {
        event.preventDefault()
        router.push('/')
      } else if ((event.ctrlKey || event.metaKey) && event.shiftKey && key === 'c') {
        event.preventDefault()
        router.push('/calendar')
      } else if (event.shiftKey && key === '?') {
        event.preventDefault()
        const evt = new CustomEvent('showShortcutsModal')
        window.dispatchEvent(evt)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  const shortcuts = [
    {
      key: 'k',
      ctrl: true,
      description: 'Open search',
      action: () => {
        router.push('/search')
      },
    },
    {
      key: '/',
      description: 'Focus search',
      action: () => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        } else {
          router.push('/search')
        }
      },
    },
    {
      key: 'n',
      ctrl: true,
      description: 'New search',
      action: () => {
        router.push('/search')
      },
    },
    {
      key: 'd',
      ctrl: true,
      description: 'Go to dashboard',
      action: () => {
        router.push('/')
      },
    },
    {
      key: 'c',
      ctrl: true,
      shift: true,
      description: 'Go to calendar',
      action: () => {
        router.push('/calendar')
      },
    },
    {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      action: () => {
        const event = new CustomEvent('showShortcutsModal')
        window.dispatchEvent(event)
      },
    },
  ]
  
  return shortcuts
}

