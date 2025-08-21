'use client'

import { useState, useEffect, useRef } from 'react'
import SessionCards, { SessionData, TodoItem } from './components/SessionCards'
import Hyperspeed from './components/Hyperspeed'

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

  const timerConfig: TimerConfig = {
    focus: 25 * 60, // 25 minutes
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60, // 15 minutes
  }

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
          setTimerType(savedTimerType as TimerType)
          setTimeLeft(timerConfig[savedTimerType as TimerType])
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
        
        // Reset state
        setStreak(0)
        setSessions(0)
        setSessionData([])
        setTimerType('focus')
        setTimeLeft(timerConfig.focus)
        setIsActive(false)
      } catch (error) {
        console.error('Error resetting progress:', error)
      }
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
      
      {/* Top Bar with Logo */}
      <div className="relative z-10 w-full">
        <div className="text-center py-6">
          <h1 className="text-white text-5xl font-bold">POMODORIN</h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col">
        {/* Timer Section */}
        <div className="flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Streak Counter */}
            <div className="text-center mb-4 text-white">
              <div className="text-lg font-semibold">
                🔥 Streak: {streak}
              </div>
            </div>

            {/* Session Counter */}
            <div className="text-center mb-2 text-white/60">
              <div className="text-sm">
                Session {currentSession} • {timerType === 'focus' ? 'Focus Time' : timerType === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </div>
            </div>

            {/* Session Indicators - Shows 4 focus sessions, 3 short breaks, and 1 long break */}
          <div className="flex justify-center gap-2 mb-8">
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

              return (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${bgColor} ${additionalClasses} transition-colors duration-300`}
                  title={
                    isFocusSession 
                      ? `Focus Session ${Math.ceil(step / 2)}`
                      : isShortBreak 
                      ? `Short Break ${step / 2}`
                      : 'Long Break'
                  }
                />
              )
            })}
          </div>

          {/* Timer Display */}
          <div className="text-center mb-4">
            <div className="relative inline-block">
              {/* Progress Ring */}
              <svg className="w-80 h-80 -rotate-90" viewBox="0 0 200 200">
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
              
              {/* Timer Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-7xl font-bold tracking-tight">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            {!isActive && timeLeft === timerConfig[timerType] ? (
              // Default state - only Start button
              <button
                onClick={handleStart}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-colors duration-200"
              >
                Start
              </button>
            ) : (
              // Timer is running or paused - show Stop, Pause/Resume, and Skip buttons
              <>
                <button
                  onClick={handleReset}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-full font-bold transition-colors duration-200"
                >
                  Stop
                </button>
                
                <button
                  onClick={handleStart}
                  className={`${
                    isActive 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white px-8 py-3 rounded-full font-bold transition-colors duration-200`}
                >
                  {isActive ? 'Pause' : 'Resume'}
                </button>

                <button
                  onClick={handleSkip}
                  className="bg-camera-accent hover:bg-camera-accent/80 text-black px-8 py-3 rounded-full font-bold transition-colors duration-200"
                >
                  Skip
                </button>
              </>
            )}
          </div>          
          </div>
        </div>

        {/* Session Cards Section */}
        <div className="pb-8">
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
  )
}
