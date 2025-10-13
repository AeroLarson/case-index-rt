'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CustomizationSettings {
  theme: 'dark' | 'light' | 'auto'
  accentColor: string
  displayDensity: 'compact' | 'comfortable' | 'spacious'
  dashboardLayout: 'default' | 'grid'
  animations: {
    pageTransitions: boolean
    particleEffects: boolean
    hoverEffects: boolean
    reduceMotion: boolean
  }
}

interface CustomizationContextType {
  settings: CustomizationSettings
  updateSettings: (settings: Partial<CustomizationSettings>) => void
  resetToDefaults: () => void
}

const defaultSettings: CustomizationSettings = {
  theme: 'dark',
  accentColor: 'blue-purple',
  displayDensity: 'comfortable',
  dashboardLayout: 'default',
  animations: {
    pageTransitions: true,
    particleEffects: true,
    hoverEffects: true,
    reduceMotion: false,
  },
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined)

export function CustomizationProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CustomizationSettings>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customization_settings')
      if (saved) {
        try {
          setSettings(JSON.parse(saved))
        } catch (error) {
          console.error('Failed to parse customization settings:', error)
        }
      }
    }
  }, [])

  // Apply settings to document
  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement

    // Apply theme (handle auto mode)
    const applyTheme = () => {
      let themeToApply = settings.theme
      if (settings.theme === 'auto') {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        themeToApply = prefersDark ? 'dark' : 'light'
      }
      root.setAttribute('data-theme', themeToApply)
    }

    applyTheme()

    // Listen for system theme changes when in auto mode
    if (settings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme()
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [settings.theme])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const root = document.documentElement

    // Apply accent color
    root.setAttribute('data-accent', settings.accentColor)

    // Apply display density
    root.setAttribute('data-density', settings.displayDensity)

    // Apply animation settings
    if (settings.animations.reduceMotion) {
      root.style.setProperty('--animation-duration', '0.01ms')
    } else {
      root.style.removeProperty('--animation-duration')
    }

    // Toggle particle effects
    const particles = document.querySelectorAll('.floating-particles')
    particles.forEach(particle => {
      if (settings.animations.particleEffects) {
        (particle as HTMLElement).style.display = ''
      } else {
        (particle as HTMLElement).style.display = 'none'
      }
    })

    // Toggle hover effects
    if (!settings.animations.hoverEffects) {
      root.classList.add('no-hover-effects')
    } else {
      root.classList.remove('no-hover-effects')
    }
  }, [settings])

  const updateSettings = (newSettings: Partial<CustomizationSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('customization_settings', JSON.stringify(updated))
    }
  }

  const resetToDefaults = () => {
    setSettings(defaultSettings)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customization_settings')
    }
  }

  return (
    <CustomizationContext.Provider value={{ settings, updateSettings, resetToDefaults }}>
      {children}
    </CustomizationContext.Provider>
  )
}

export function useCustomization() {
  const context = useContext(CustomizationContext)
  if (!context) {
    throw new Error('useCustomization must be used within CustomizationProvider')
  }
  return context
}

