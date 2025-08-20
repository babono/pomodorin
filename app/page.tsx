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

  const handleTimerTypeChange = (type: TimerType) => {
    setTimerType(type)
    setTimeLeft(timerConfig[type])
    setIsActive(false)
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

            {/* Timer Type Buttons */}
            <div className="flex gap-3 justify-center mb-8">
              {(['focus', 'shortBreak', 'longBreak'] as TimerType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleTimerTypeChange(type)}
                  className={`px-6 py-2 rounded-full transition-all duration-200 ${
                    timerType === type
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white/20 text-white/80 hover:bg-white/30'
                  }`}
                >
                  {timerLabels[type]}
                </button>
              ))}
            </div>

            {/* Session Indicators */}
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4].map((session) => (
                <div
                  key={session}
                  className={`w-3 h-3 rounded-full ${
                    session <= sessions ? 'bg-white' : session === currentSession ? 'bg-blue-400' : 'bg-white/30'
                  }`}
                />
              ))}
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
            <button
              onClick={handleStart}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              {isActive ? 'Pause' : 'Start'}
            </button>
            
            <button
              onClick={handleReset}
              className="p-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
              title="Reset"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              className="p-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
              title="Minimize"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
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
