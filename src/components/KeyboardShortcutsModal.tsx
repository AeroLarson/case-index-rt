'use client'

import { useState, useEffect } from 'react'

interface Shortcut {
  keys: string[]
  description: string
  category: string
}

const shortcuts: Shortcut[] = [
  { keys: ['Ctrl', 'K'], description: 'Open search', category: 'Navigation' },
  { keys: ['/'], description: 'Focus search', category: 'Navigation' },
  { keys: ['Ctrl', 'N'], description: 'New search', category: 'Navigation' },
  { keys: ['Ctrl', 'D'], description: 'Go to dashboard', category: 'Navigation' },
  { keys: ['Ctrl', 'Shift', 'C'], description: 'Go to calendar', category: 'Navigation' },
  { keys: ['?'], description: 'Show shortcuts', category: 'Help' },
  { keys: ['Esc'], description: 'Close modal', category: 'General' },
]

export default function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleShow = () => setIsOpen(true)
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('showShortcutsModal', handleShow)
    window.addEventListener('keydown', handleEsc)

    return () => {
      window.removeEventListener('showShortcutsModal', handleShow)
      window.removeEventListener('keydown', handleEsc)
    }
  }, [])

  if (!isOpen) return null

  const categories = Array.from(new Set(shortcuts.map(s => s.category)))

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setIsOpen(false)}>
      <div className="apple-card p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Keyboard Shortcuts</h2>
            <p className="text-gray-400 text-sm">Press ? to show this modal anytime</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-6">
            <h3 className="text-purple-400 font-semibold mb-3">{category}</h3>
            <div className="space-y-2">
              {shortcuts
                .filter((s) => s.category === category)
                .map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700/50">
                    <span className="text-gray-300">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, idx) => (
                        <kbd
                          key={idx}
                          className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs font-mono text-white"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        <div className="mt-6 pt-4 border-t border-slate-700">
          <p className="text-gray-400 text-sm text-center">
            <i className="fa-solid fa-lightbulb text-yellow-400 mr-2"></i>
            Tip: Use these shortcuts to navigate faster!
          </p>
        </div>
      </div>
    </div>
  )
}

