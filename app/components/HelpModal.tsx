'use client'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-container-background backdrop-blur-md rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-2xl font-bold">
            How Pomodoro Works
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
        
        <div className="space-y-6 text-white/90">
          <div>
            <h4 className="text-lg font-semibold mb-3">What is the Pomodoro Technique?</h4>
            <p className="leading-relaxed">
              The Pomodoro Technique is a time management method that uses a timer to break work into intervals, 
              traditionally 25 minutes in length, separated by short breaks. Each interval is known as a &quot;pomodoro.&quot;
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">How to Use Pomodorin</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                <p>Click &quot;Start&quot; to begin a 25-minute focus session. Stay concentrated on your work during this time.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                <p>After each focus session, take a 5-minute short break to rest and recharge.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                <p>Complete 4 focus sessions, then enjoy a 15-minute long break to fully reset.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                <p>Repeat the cycle! Track your progress with the cycle counter and session indicators.</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">Session Indicators</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>Focus sessions (25 minutes each)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span>Short breaks (5 minutes each)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>Long break (15 minutes)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Completed sessions</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">Features</h4>
            <ul className="space-y-2 list-disc list-inside">
              <li>Visual progress tracking with an animated progress ring</li>
              <li>Cycle counter to track your productivity streaks</li>
              <li>Session notes and todo management</li>
              <li>AI-powered motivational quotes</li>
              <li>Hyperspeed visual effects during focus sessions</li>
              <li>Automatic session transitions</li>
            </ul>
          </div>

          <div className="bg-camera-accent  rounded-lg p-4 text-black">
            <h4 className="text-lg font-bold mb-2">Pro Tip</h4>
            <p>
              During focus sessions, avoid distractions like social media, emails, or non-urgent tasks. 
              Use the notes section to quickly jot down any thoughts that come to mind without breaking your focus.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end mt-6 pt-4 border-t border-white/20">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-accent text-white rounded-full hover:bg-accent/80 transition-colors duration-200"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
