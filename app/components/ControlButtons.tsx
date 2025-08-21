'use client'

import { useState } from 'react'
import MusicPlayer from './MusicPlayer'
import Image from 'next/image'

interface ControlButtonsProps {
  onGenerateQuote: () => Promise<void>
}

export default function ControlButtons({ onGenerateQuote }: ControlButtonsProps) {
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false)

  const handleGenerateQuote = async () => {
    setIsGeneratingQuote(true)
    try {
      await onGenerateQuote()
    } finally {
      setIsGeneratingQuote(false)
    }
  }

  return (
    <div className="flex justify-center gap-4 pb-4">
      <MusicPlayer />  
      <button
        onClick={handleGenerateQuote}
        disabled={isGeneratingQuote}
        className={`${
          isGeneratingQuote 
            ? 'bg-gradient-to-r from-[#66A1F3] via-[#22C9A6] to-[#66A1F3] animated-background cursor-not-allowed' 
            : 'bg-gradient-to-r from-[#66A1F3] to-[#22C9A6] hover:from-[#5A91E3] hover:to-[#1FB896]'
        } text-white px-6 py-3 rounded-full font-bold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-teal-500/25`}
      >
        <Image
          src="/ic-ai.svg"
          alt="AI Generate"
          width={20}
          height={20}
          className={`w-5 h-5 ${isGeneratingQuote ? 'animate-spin' : ''}`}
        />
        <span className="text-base">
          {isGeneratingQuote ? 'Generating...' : 'New Quote'}
        </span>
      </button>            
    </div>
  )
}
