'use client'

import { useState } from 'react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
}

export default function NotesSection() {
  const [notes, setNotes] = useState<Note[]>([])
  const [showAddNote, setShowAddNote] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '' })
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editNote, setEditNote] = useState({ title: '', content: '' })

  const handleAddNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title || 'Untitled',
        content: newNote.content,
        createdAt: new Date()
      }
      setNotes([...notes, note])
      setNewNote({ title: '', content: '' })
      setShowAddNote(false)
    }
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id))
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note.id)
    setEditNote({ title: note.title, content: note.content })
  }

  const handleSaveEdit = () => {
    if (editingNote) {
      setNotes(notes.map(note => 
        note.id === editingNote 
          ? { ...note, title: editNote.title || 'Untitled', content: editNote.content }
          : note
      ))
      setEditingNote(null)
      setEditNote({ title: '', content: '' })
    }
  }

  const handleCancelEdit = () => {
    setEditingNote(null)
    setEditNote({ title: '', content: '' })
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2 className="text-white text-2xl font-medium text-center mb-8">
        Focus Notes 📝
      </h2>

      {/* Add Note Button */}
      <div className="mb-6 text-center">
        <button
          onClick={() => setShowAddNote(true)}
          className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-200"
        >
          ➕ Add Note
        </button>
      </div>

      {/* Add Note Form */}
      {showAddNote && (
        <div className="mb-6 p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Note Title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400"
            />
            <textarea
              placeholder="Note Content"
              rows={4}
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400 resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAddNote(false)}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/15 hover:transform hover:scale-[1.02] transition-all duration-200"
          >
            {editingNote === note.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editNote.title}
                  onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400"
                />
                <textarea
                  value={editNote.content}
                  onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400 resize-none"
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-white/70 hover:text-white transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-white text-xl font-medium">{note.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-2 text-white/70 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all duration-200"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="text-white/80 mb-3 whitespace-pre-wrap">{note.content}</p>
                <p className="text-white/50 text-sm">
                  {note.createdAt.toLocaleDateString()} at {note.createdAt.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {notes.length === 0 && !showAddNote && (
        <div className="text-center py-12">
          <p className="text-white/60 text-lg">
            No notes yet. Add your first note to capture your focus thoughts! 💭
          </p>
        </div>
      )}
    </div>
  )
}
