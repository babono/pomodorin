'use client'

import { useState } from 'react'

interface QuickNote {
  id: string
  content: string
  createdAt: Date
  session: number
  timerType: string
}

interface QuickNoteDialogProps {
  onSaveNote: (note: Omit<QuickNote, 'id' | 'createdAt'>) => void
  currentSession: number
  currentTimerType: string
}

export default function QuickNoteDialog({ 
  onSaveNote, 
  currentSession, 
  currentTimerType 
}: QuickNoteDialogProps) {
  const [open, setOpen] = useState(false)
  const [noteContent, setNoteContent] = useState('')

  const handleSave = () => {
    if (noteContent.trim()) {
      onSaveNote({
        content: noteContent,
        session: currentSession,
        timerType: currentTimerType
      })
      setNoteContent('')
      setOpen(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setNoteContent('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
        title="Quick Note"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-lg p-6 w-full max-w-md border border-white/20">
            <h3 className="text-white text-xl font-medium mb-4">
              Quick Focus Note
            </h3>
            
            <textarea
              autoFocus
              placeholder="What's on your mind?"
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400 resize-none mb-4"
            />
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
