'use client'

import { useState } from 'react'

export interface TodoItem {
  id: string
  text: string
  completed: boolean
  createdAt: Date
}

export interface SessionData {
  sessionNumber: number
  todos: TodoItem[]
  isCompleted: boolean
}

interface SessionCardsProps {
  currentSession: number
  sessions: SessionData[]
  onUpdateSession: (sessionNumber: number, todos: TodoItem[]) => void
  onCompleteSession: (sessionNumber: number) => void
}

export default function SessionCards({ 
  currentSession, 
  sessions, 
  onUpdateSession,
  onCompleteSession 
}: SessionCardsProps) {
  const [newTodos, setNewTodos] = useState<{ [key: number]: string }>({})

  const handleAddTodo = (sessionNumber: number) => {
    const todoText = newTodos[sessionNumber]?.trim()
    if (todoText) {
      const session = sessions.find(s => s.sessionNumber === sessionNumber)
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        text: todoText,
        completed: false,
        createdAt: new Date()
      }
      
      const updatedTodos = session ? [...session.todos, newTodo] : [newTodo]
      onUpdateSession(sessionNumber, updatedTodos)
      setNewTodos({ ...newTodos, [sessionNumber]: '' })
    }
  }

  const handleToggleTodo = (sessionNumber: number, todoId: string) => {
    const session = sessions.find(s => s.sessionNumber === sessionNumber)
    if (session) {
      const updatedTodos = session.todos.map(todo =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
      onUpdateSession(sessionNumber, updatedTodos)
    }
  }

  const handleDeleteTodo = (sessionNumber: number, todoId: string) => {
    const session = sessions.find(s => s.sessionNumber === sessionNumber)
    if (session) {
      const updatedTodos = session.todos.filter(todo => todo.id !== todoId)
      onUpdateSession(sessionNumber, updatedTodos)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, sessionNumber: number) => {
    if (e.key === 'Enter') {
      handleAddTodo(sessionNumber)
    }
  }

  const getSessionData = (sessionNumber: number): SessionData => {
    return sessions.find(s => s.sessionNumber === sessionNumber) || {
      sessionNumber,
      todos: [],
      isCompleted: false
    }
  }

  const getCompletedCount = (session: SessionData): number => {
    return session.todos.filter(todo => todo.completed).length
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h3 className="text-white text-xl font-medium text-center mb-6">
        Focus Sessions 🍅
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((sessionNumber) => {
          const session = getSessionData(sessionNumber)
          const completedCount = getCompletedCount(session)
          const totalCount = session.todos.length
          const isActive = currentSession === sessionNumber
          const isPast = currentSession > sessionNumber
          const isFuture = currentSession < sessionNumber
          
          return (
            <div
              key={sessionNumber}
              className={`
                relative p-4 rounded-lg border backdrop-blur-md transition-all duration-300
                ${isActive 
                  ? 'bg-blue-600/20 border-blue-400/50 shadow-lg shadow-blue-500/20' 
                  : isPast
                  ? 'bg-green-600/10 border-green-400/30'
                  : 'bg-white/10 border-white/20'
                }
                ${isFuture ? 'opacity-60' : ''}
                hover:scale-105 hover:bg-opacity-80
              `}
            >
              {/* Session Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`
                    w-3 h-3 rounded-full
                    ${isActive ? 'bg-blue-400 animate-pulse' 
                      : isPast ? 'bg-green-400' 
                      : 'bg-white/30'}
                  `} />
                  <h4 className="text-white font-medium">
                    Session {sessionNumber}
                  </h4>
                </div>
                {totalCount > 0 && (
                  <div className="text-white/60 text-sm">
                    {completedCount}/{totalCount}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {totalCount > 0 && (
                <div className="mb-4">
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isActive ? 'bg-blue-400' : 'bg-green-400'
                      }`}
                      style={{ width: `${(completedCount / totalCount) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Add Todo Input */}
              {!isFuture && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add focus task..."
                      value={newTodos[sessionNumber] || ''}
                      onChange={(e) => setNewTodos({ 
                        ...newTodos, 
                        [sessionNumber]: e.target.value 
                      })}
                      onKeyPress={(e) => handleKeyPress(e, sessionNumber)}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white text-sm placeholder-white/60 focus:outline-none focus:border-blue-400"
                      disabled={isFuture}
                    />
                    <button
                      onClick={() => handleAddTodo(sessionNumber)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
                      disabled={!newTodos[sessionNumber]?.trim()}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Todo List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {session.todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`
                      flex items-center gap-2 p-2 rounded-md transition-all duration-200
                      ${todo.completed 
                        ? 'bg-green-600/20 border border-green-400/30' 
                        : 'bg-white/5 border border-white/20'
                      }
                      hover:bg-white/10
                    `}
                  >
                    <button
                      onClick={() => handleToggleTodo(sessionNumber, todo.id)}
                      className={`
                        w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200
                        ${todo.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-white/40 hover:border-white/60'
                        }
                      `}
                    >
                      {todo.completed && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    
                    <span className={`
                      flex-1 text-white text-sm transition-all duration-200
                      ${todo.completed ? 'line-through opacity-60' : ''}
                    `}>
                      {todo.text}
                    </span>
                    
                    <button
                      onClick={() => handleDeleteTodo(sessionNumber, todo.id)}
                      className="text-white/40 hover:text-red-400 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Future Session Indicator */}
              {isFuture && session.todos.length === 0 && (
                <div className="text-center py-6 text-white/40 text-sm">
                  <div className="mb-2">🔒</div>
                  <div>Complete Session {currentSession} first</div>
                </div>
              )}

              {/* Empty State */}
              {!isFuture && session.todos.length === 0 && (
                <div className="text-center py-4 text-white/50 text-sm">
                  No tasks yet. Add one above! ✨
                </div>
              )}

              {/* Session Complete Badge */}
              {isPast && completedCount === totalCount && totalCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  ✓ Done
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
