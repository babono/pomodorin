'use client'

import { useState, useEffect, useRef } from 'react'
import { Tooltip } from '@mui/material'
import SessionCards, { SessionData, TodoItem } from './components/SessionCards'
import Hyperspeed from './components/Hyperspeed'
import AIQuoteGenerator, { AIQuoteGeneratorRef } from './components/AIQuoteGenerator'
import ControlButtons from './components/ControlButtons'
import HelpModal from './components/HelpModal'
import SettingsModal from './components/SettingsModal'

type TimerType = 'focus' | 'shortBreak' | 'longBreak'

interface TimerConfig {
  focus: number
  shortBreak: number
  longBreak: number
}

export default function PomodoroTimer() {
  const [timerType, setTimerType] = useState<TimerType>('focus')
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [streak, setStreak] = useState(0)
  const [sessionData, setSessionData] = useState<SessionData[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const quoteGeneratorRef = useRef<AIQuoteGeneratorRef>(null)
  
  // Modal states
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const [timerConfig, setTimerConfig] = useState<TimerConfig>({
    focus: 25 * 60, // 25 minutes
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60, // 15 minutes
  })

  const timerLabels = {
    focus: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
  }

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const savedStreak = localStorage.getItem('pomodorin-streak')
        const savedSessions = localStorage.getItem('pomodorin-sessions')
        const savedSessionData = localStorage.getItem('pomodorin-session-data')
        const savedTimerType = localStorage.getItem('pomodorin-timer-type')
        const savedTimerConfig = localStorage.getItem('pomodorin-timer-config')
        
        // Load timer config first
        if (savedTimerConfig) {
          const parsedConfig = JSON.parse(savedTimerConfig)
          setTimerConfig(parsedConfig)
        }
        
        if (savedStreak) setStreak(parseInt(savedStreak, 10))
        if (savedSessions) setSessions(parseInt(savedSessions, 10))
        if (savedSessionData) {
          const parsed = JSON.parse(savedSessionData)
          // Convert date strings back to Date objects
          const processedData = parsed.map((session: SessionData) => ({
            ...session,
            todos: session.todos.map((todo: TodoItem) => ({
              ...todo,
              createdAt: new Date(todo.createdAt)
            }))
          }))
          setSessionData(processedData)
        }
        if (savedTimerType && ['focus', 'shortBreak', 'longBreak'].includes(savedTimerType)) {
          const configToUse = savedTimerConfig ? JSON.parse(savedTimerConfig) : timerConfig
          setTimerType(savedTimerType as TimerType)
          setTimeLeft(configToUse[savedTimerType as TimerType])
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadFromStorage()
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return // Don't save during initial load
    
    try {
      localStorage.setItem('pomodorin-streak', streak.toString())
    } catch (error) {
      console.error('Error saving streak to localStorage:', error)
    }
  }, [streak, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    
    try {
      localStorage.setItem('pomodorin-sessions', sessions.toString())
    } catch (error) {
      console.error('Error saving sessions to localStorage:', error)
    }
  }, [sessions, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    
    try {
      localStorage.setItem('pomodorin-session-data', JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving session data to localStorage:', error)
    }
  }, [sessionData, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    
    try {
      localStorage.setItem('pomodorin-timer-type', timerType)
    } catch (error) {
      console.error('Error saving timer type to localStorage:', error)
    }
  }, [timerType, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    
    try {
      localStorage.setItem('pomodorin-timer-config', JSON.stringify(timerConfig))
    } catch (error) {
      console.error('Error saving timer config to localStorage:', error)
    }
  }, [timerConfig, isLoaded])

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false)
            // Auto-switch to next phase
            if (timerType === 'focus') {
              setSessions(prev => prev + 1)
              const nextType = (sessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak'
              setTimerType(nextType)
              return timerConfig[nextType]
            } else if (timerType === 'longBreak') {
              // After long break, complete the cycle and restart
              setStreak(prev => prev + 1)
              setSessions(0) // Reset sessions to 0 for new cycle
              setSessionData([]) // Clear all session notes and todos
              setTimerType('focus')
              return timerConfig.focus
            } else {
              // After short break, go to next focus session
              setTimerType('focus')
              return timerConfig.focus
            }
          }
          return time - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, timeLeft, timerType, sessions, timerConfig])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsActive(!isActive)
  }

  const handleReset = () => {
    setIsActive(false)
    setTimeLeft(timerConfig[timerType])
  }

  const handleSkip = () => {
    setIsActive(false)
    // Skip to next phase
    if (timerType === 'focus') {
      setSessions(prev => prev + 1)
      const nextType = (sessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak'
      setTimerType(nextType)
      setTimeLeft(timerConfig[nextType])
    } else if (timerType === 'longBreak') {
      // After long break, complete the cycle and restart
      setStreak(prev => prev + 1)
      setSessions(0) // Reset sessions to 0 for new cycle
      setSessionData([]) // Clear all session notes and todos
      setTimerType('focus')
      setTimeLeft(timerConfig.focus)
    } else {
      // After short break, go to next focus session
      setTimerType('focus')
      setTimeLeft(timerConfig.focus)
    }
  }

  const handleUpdateSession = (sessionNumber: number, todos: TodoItem[]) => {
    setSessionData(prevData => {
      const existingSessionIndex = prevData.findIndex(s => s.sessionNumber === sessionNumber)
      if (existingSessionIndex >= 0) {
        const updatedData = [...prevData]
        updatedData[existingSessionIndex] = {
          ...updatedData[existingSessionIndex],
          todos
        }
        return updatedData
      } else {
        return [...prevData, {
          sessionNumber,
          todos,
          isCompleted: false
        }]
      }
    })
  }

  const handleCompleteSession = (sessionNumber: number) => {
    setSessionData(prevData => {
      return prevData.map(session =>
        session.sessionNumber === sessionNumber
          ? { ...session, isCompleted: true }
          : session
      )
    })
  }

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This will clear your streak, sessions, and all notes.')) {
      try {
        // Clear localStorage
        localStorage.removeItem('pomodorin-streak')
        localStorage.removeItem('pomodorin-sessions')
        localStorage.removeItem('pomodorin-session-data')
        localStorage.removeItem('pomodorin-timer-type')
        localStorage.removeItem('pomodorin-timer-config')
        
        // Reset state
        setStreak(0)
        setSessions(0)
        setSessionData([])
        setTimerType('focus')
        const defaultConfig = {
          focus: 25 * 60,
          shortBreak: 5 * 60,
          longBreak: 15 * 60,
        }
        setTimerConfig(defaultConfig)
        setTimeLeft(defaultConfig.focus)
        setIsActive(false)
      } catch (error) {
        console.error('Error resetting progress:', error)
      }
    }
  }

  const handleSaveSettings = (newConfig: TimerConfig) => {
    setTimerConfig(newConfig)
    // If timer is not running and we're at the start of a session, update time
    if (!isActive && timeLeft === timerConfig[timerType]) {
      setTimeLeft(newConfig[timerType])
    }
  }

  const progress = (timeLeft / timerConfig[timerType]) * 100
  // Calculate current session display based on timer type
  const currentSession = timerType === 'focus' ? sessions + 1 : sessions
  
  // Get progress circle color based on timer type
  const getProgressColor = () => {
    switch (timerType) {
      case 'focus':
        return 'rgba(56, 122, 255, 1)' // Blue (matches bg-blue-400)
      case 'shortBreak':
        return 'rgba(251, 191, 36, 0.8)' // Yellow (matches bg-yellow-400)
      case 'longBreak':
        return 'rgba(248, 113, 113, 0.8)' // Red (matches bg-red-400)
      default:
        return 'rgba(255, 255, 255, 0.8)' // Fallback white
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hyperspeed Background */}
      <Hyperspeed isTimerRunning={isActive && timerType === 'focus'} />
      
      {/* Top Right Buttons */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => setIsHelpModalOpen(true)}
          className="p-3 rounded-full transition-all duration-200 hover:bg-white/10"
          style={{ backgroundColor: 'rgba(180, 180, 180, 0.2)' }}
          title="Help"
        >
          <img src="/ic-help.svg" alt="Help" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1) opacity(0.7)' }} />
        </button>
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="p-3 rounded-full transition-all duration-200 hover:bg-white/10"
          style={{ backgroundColor: 'rgba(180, 180, 180, 0.2)' }}
          title="Settings"
        >
          <img src="/ic-settings.svg" alt="Settings" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1) opacity(0.7)' }} />
        </button>
      </div>
      
      {/* Main Content Container - Centered */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center">
        {/* Top Bar with Logo */}
        <div className="w-full">
          <div className="text-center py-4 sm:py-6 px-4">
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">POMODORIN</h1>
            <AIQuoteGenerator ref={quoteGeneratorRef} />
          </div>
        </div>
        {/* Control Buttons Section */}
          <ControlButtons 
            onGenerateQuote={async () => {
              if (quoteGeneratorRef.current) {
                await quoteGeneratorRef.current.generateNewQuote()
              }
            }} 
          />
        
        {/* Main Content */}
        <div className="flex flex-col flex-1 justify-center">
        {/* Timer Section */}
        <div className="flex items-center justify-center p-4">
          <div className="max-w-md w-full px-4">
          {/* Timer Display */}
          <div className="text-center mb-4">
            <div className="relative flex justify-center w-full">
              {/* Progress Ring */}
              <svg className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 -rotate-90 max-w-full" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke={getProgressColor()}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                  className="transition-all duration-1000 ease-in-out"
                />
              </svg>
              
              {/* Timer Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* Streak Counter */}
                <div className="text-white text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5">
                    <path fillRule="evenodd" clipRule="evenodd" d="M17.1085 5H19.5755C19.9895 5 20.3255 4.664 20.3255 4.25C20.3255 3.836 19.9895 3.5 19.5755 3.5H14.8955C14.2115 3.5 13.6545 4.057 13.6545 4.742V9.16C13.6545 9.574 13.9895 9.91 14.4045 9.91C14.8185 9.91 15.1545 9.574 15.1545 9.16V5.563C17.5645 6.756 19.1095 9.215 19.1095 11.912C19.1095 15.82 15.9205 19 11.9995 19C8.0805 19 4.8905 15.82 4.8905 11.912C4.8905 8.659 7.0975 5.832 10.2565 5.038C10.6585 4.938 10.9025 4.529 10.8005 4.128C10.7005 3.727 10.2915 3.482 9.8905 3.583C6.0635 4.546 3.3905 7.971 3.3905 11.912C3.3905 16.647 7.2535 20.5 11.9995 20.5C16.7475 20.5 20.6095 16.647 20.6095 11.912C20.6095 9.154 19.2785 6.599 17.1085 5Z" fill="currentColor"/>
                  </svg>
                  Cycle Count: {streak}
                </div>
                
                {/* Timer Text */}
                <div className="text-white text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-3 sm:mb-4">
                  {formatTime(timeLeft)}
                </div>
                
                {/* Session Counter */}
                <div className="text-white/60 text-xs sm:text-sm mb-3 sm:mb-4">
                  Session {currentSession} • {timerType === 'focus' ? 'Focus Time' : timerType === 'shortBreak' ? 'Short Break' : 'Long Break'}
                </div>

                {/* Session Indicators */}
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="flex gap-1 sm:gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => {
                      // Determine if this is a focus session (odd numbers) or break (even numbers)
                      const isFocusSession = step % 2 === 1
                      const isShortBreak = step % 2 === 0 && step !== 8
                      const isLongBreak = step === 8
                      
                      // Calculate current position in the cycle
                      // For focus sessions: step 1,3,5,7 correspond to focus sessions 1,2,3,4
                      // For breaks: step 2,4,6,8 correspond to breaks after sessions 1,2,3,4
                      let currentStep
                      if (timerType === 'focus') {
                        currentStep = (sessions * 2) + 1 // Focus sessions are at odd steps
                      } else {
                        currentStep = sessions * 2 // Breaks are at even steps
                      }
                      const isCurrentStep = step === currentStep
                      const isCompleted = step < currentStep
                      
                      let bgColor = 'bg-white/30' // Default (not reached)
                      let additionalClasses = ''
                      
                      if (isCompleted) {
                        if (isFocusSession) bgColor = 'bg-green-500' // Changed from white to green for completed focus sessions
                        else if (isShortBreak) bgColor = 'bg-yellow-400'
                        else if (isLongBreak) bgColor = 'bg-red-400'
                      } else if (isCurrentStep) {
                        if (isFocusSession) {
                          bgColor = 'bg-blue-400'
                          // Add blinking animation only when timer is actually running
                          if (isActive) additionalClasses = 'animate-pulse'
                        }
                        else if (isShortBreak) {
                          bgColor = 'bg-yellow-300'
                          if (isActive) additionalClasses = 'animate-pulse'
                        }
                        else if (isLongBreak) {
                          bgColor = 'bg-red-300'
                          if (isActive) additionalClasses = 'animate-pulse'
                        }
                      }

                      const tooltipTitle = isFocusSession 
                        ? `Focus Session ${Math.ceil(step / 2)}`
                        : isShortBreak 
                        ? `Short Break ${step / 2}`
                        : 'Long Break'

                      return (
                        <Tooltip
                          key={step}
                          title={tooltipTitle}
                          arrow
                          placement="bottom"
                        >
                          <div
                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${bgColor} ${additionalClasses} transition-colors duration-300 cursor-help`}
                          />
                        </Tooltip>
                      )
                    })}
                  </div>
                  
                  {/* Current Session Icon */}
                  <div className="flex items-center justify-center">
                    {timerType === 'focus' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-7 sm:h-7">
                        <path d="M12.153 3.24991V5.16091M12.153 19.1454V21.0564M21.0558 12.1532H19.1458M5.16031 12.1532H3.25031M12.153 5.15321C16.019 5.15321 19.153 8.28721 19.153 12.1532C19.153 16.0182 16.019 19.1532 12.153 19.1532C8.28701 19.1532 5.15301 16.0182 5.15301 12.1532C5.15301 8.28721 8.28701 5.15321 12.153 5.15321ZM12.153 9.02821C10.427 9.02821 9.02801 10.4272 9.02801 12.1532C9.02801 13.8792 10.427 15.2782 12.153 15.2782C13.879 15.2782 15.278 13.8792 15.278 12.1532C15.278 10.4272 13.879 9.02821 12.153 9.02821Z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-7 sm:h-7">
                        <path d="M12 7.5957V11.3657C12 11.6457 12.227 11.8737 12.507 11.8737H15.576M20.5 12C20.5 7.305 16.695 3.5 12 3.5C7.306 3.5 3.5 7.305 3.5 12C3.5 16.695 7.306 20.5 12 20.5C16.695 20.5 20.5 16.695 20.5 12Z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-2 sm:gap-4 px-4">
            {!isActive && timeLeft === timerConfig[timerType] ? (
              // Default state - only Start button
              <button
                onClick={handleStart}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold transition-colors duration-200 text-sm sm:text-base"
              >
                Start
              </button>
            ) : (
              // Timer is running or paused - show Stop, Pause/Resume, and Skip buttons
              <>
                <button
                  onClick={handleReset}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-full font-bold transition-colors duration-200 text-sm sm:text-base"
                >
                  Stop
                </button>
                
                <button
                  onClick={handleStart}
                  className={`${
                    isActive 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white px-4 sm:px-8 py-2 sm:py-3 rounded-full font-bold transition-colors duration-200 text-sm sm:text-base`}
                >
                  {isActive ? 'Pause' : 'Resume'}
                </button>

                <button
                  onClick={handleSkip}
                  className="bg-camera-accent hover:bg-camera-accent/80 text-black px-4 sm:px-8 py-2 sm:py-3 rounded-full font-bold transition-colors duration-200 text-sm sm:text-base"
                >
                  Skip
                </button>
              </>
            )}
          </div>          
          </div>
        </div>

          {/* Session Cards Section */}
          <div className="pb-4">
            <SessionCards
              currentSession={currentSession}
              sessions={sessionData}
              onUpdateSession={handleUpdateSession}
              onCompleteSession={handleCompleteSession}
              isTimerActive={isActive}
            />
          </div>
          
        </div>
      </div>

      {/* Modals */}
      <HelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentConfig={timerConfig}
        onSave={handleSaveSettings}
      />
    </div>
  )
}
