'use client'

import { useState, useEffect } from 'react'

interface TimerConfig {
  focus: number
  shortBreak: number
  longBreak: number
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentConfig: TimerConfig
  onSave: (config: TimerConfig) => void
}

export default function SettingsModal({ isOpen, onClose, currentConfig, onSave }: SettingsModalProps) {
  const [focusMinutes, setFocusMinutes] = useState(Math.floor(currentConfig.focus / 60))
  const [shortBreakMinutes, setShortBreakMinutes] = useState(Math.floor(currentConfig.shortBreak / 60))
  const [longBreakMinutes, setLongBreakMinutes] = useState(Math.floor(currentConfig.longBreak / 60))

  // Update local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFocusMinutes(Math.floor(currentConfig.focus / 60))
      setShortBreakMinutes(Math.floor(currentConfig.shortBreak / 60))
      setLongBreakMinutes(Math.floor(currentConfig.longBreak / 60))
    }
  }, [isOpen, currentConfig])

  if (!isOpen) return null

  const handleSave = () => {
    const newConfig: TimerConfig = {
      focus: focusMinutes * 60,
      shortBreak: shortBreakMinutes * 60,
      longBreak: longBreakMinutes * 60
    }
    onSave(newConfig)
    onClose()
  }

  const handleReset = () => {
    // Reset to default values
    setFocusMinutes(25)
    setShortBreakMinutes(5)
    setLongBreakMinutes(15)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-container-background backdrop-blur-md rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-xl font-bold">
            Timer Settings
          </h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Focus Session Duration */}
          <div>
            <label htmlFor="focus" className="block text-white text-sm font-medium mb-2">
              Focus Session Duration
            </label>
            <div className="relative">
              <input
                id="focus"
                type="number"
                min="1"
                max="120"
                value={focusMinutes}
                onChange={(e) => setFocusMinutes(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400 pr-16"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 text-sm">
                minutes
              </span>
            </div>
            <p className="text-white/50 text-xs mt-1">Recommended: 25 minutes</p>
          </div>

          {/* Short Break Duration */}
          <div>
            <label htmlFor="shortBreak" className="block text-white text-sm font-medium mb-2">
              Short Break Duration
            </label>
            <div className="relative">
              <input
                id="shortBreak"
                type="number"
                min="1"
                max="30"
                value={shortBreakMinutes}
                onChange={(e) => setShortBreakMinutes(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-yellow-400 pr-16"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 text-sm">
                minutes
              </span>
            </div>
            <p className="text-white/50 text-xs mt-1">Recommended: 5 minutes</p>
          </div>

          {/* Long Break Duration */}
          <div>
            <label htmlFor="longBreak" className="block text-white text-sm font-medium mb-2">
              Long Break Duration
            </label>
            <div className="relative">
              <input
                id="longBreak"
                type="number"
                min="5"
                max="60"
                value={longBreakMinutes}
                onChange={(e) => setLongBreakMinutes(parseInt(e.target.value) || 5)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-red-400 pr-16"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 text-sm">
                minutes
              </span>
            </div>
            <p className="text-white/50 text-xs mt-1">Recommended: 15 minutes</p>
          </div>

          {/* Info Box */}
          <div className="bg-camera-accent rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-black mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-black font-bold text-sm">Note</h4>
                <p className="text-black text-sm mt-1">
                  Timer changes will take effect on the next session. Current session will continue with the previous settings.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-between mt-6 pt-4 border-t border-white/20">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 transition-colors rounded-full duration-200 font-bold text-sm order-2 sm:order-1"
          >
            Reset to Default
          </button>
          <div className="flex gap-3 order-1 sm:order-2">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-full transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none px-6 py-2 bg-accent text-white font-bold rounded-full hover:bg-accent/80 transition-colors duration-200"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
