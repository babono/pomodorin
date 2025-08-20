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
  const [sessionData, setSessionData] = useState<SessionData[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
            } else {
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

  const progress = ((timerConfig[timerType] - timeLeft) / timerConfig[timerType]) * 100
  const currentSession = sessions + 1

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hyperspeed Background */}
      <Hyperspeed isTimerRunning={isActive && timerType === 'focus'} />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main Timer Section */}
        <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="text-white/90">
                <div className="text-2xl font-bold">flocus</div>
                <div className="text-sm opacity-75">by SIDFIT</div>
              </div>
              <div className="text-white/70 text-right">
                <div className="text-lg font-medium">"What lasts long won't</div>
                <div className="text-lg font-medium">come easy"</div>
              </div>
            </div>

            <h1 className="text-white text-2xl font-medium mb-8">
              What do you want to focus on? ✏️
            </h1>

            {/* Session Indicators - Shows 4 focus sessions, 3 short breaks, and 1 long break */}
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => {
                // Determine if this is a focus session (odd numbers) or break (even numbers)
                const isFocusSession = step % 2 === 1
                const isShortBreak = step % 2 === 0 && step !== 8
                const isLongBreak = step === 8
                
                // Calculate current position in the cycle
                const currentStep = sessions * 2 + (timerType === 'focus' ? 1 : 2)
                const isActive = step === currentStep
                const isCompleted = step < currentStep
                
                let bgColor = 'bg-white/30' // Default (not reached)
                if (isCompleted) {
                  if (isFocusSession) bgColor = 'bg-white'
                  else if (isShortBreak) bgColor = 'bg-yellow-400'
                  else if (isLongBreak) bgColor = 'bg-red-400'
                } else if (isActive) {
                  if (isFocusSession) bgColor = 'bg-blue-400'
                  else if (isShortBreak) bgColor = 'bg-yellow-300'
                  else if (isLongBreak) bgColor = 'bg-red-300'
                }

                return (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full ${bgColor} transition-colors duration-300`}
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
          </div>

          {/* Timer Display */}
          <div className="text-center mb-12">
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
                  stroke="rgba(255,255,255,0.8)"
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
                <div className="text-white text-8xl font-light tracking-tight">
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Start
              </button>
            ) : (
              // Timer is running or paused - show Stop and Pause/Resume buttons
              <>
                <button
                  onClick={handleReset}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Stop
                </button>
                
                <button
                  onClick={handleStart}
                  className={`${
                    isActive 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200`}
                >
                  {isActive ? 'Pause' : 'Resume'}
                </button>
              </>
            )}
          </div>

          {/* Session Counter */}
          <div className="text-center mt-8 text-white/60">
            <div className="text-sm">
              Session {currentSession} • {timerType === 'focus' ? 'Focus Time' : timerType === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </div>
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
          />
        </div>
      </div>
    </div>
  )
}
