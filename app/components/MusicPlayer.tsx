'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/audio-lofi.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = 0.5

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const toggleMusic = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }

  return (
    <button
      onClick={toggleMusic}
      className="bg-pink-500 hover:bg-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-pink-500/25"
    >
      <Image
        src={isPlaying ? '/ic-pause.svg' : '/ic-play.svg'}
        alt={isPlaying ? 'Pause' : 'Play'}
        width={20}
        height={20}
        className="w-5 h-5"
      />
      <span className="text-sm sm:text-base">
        {isPlaying ? 'Pause Lofi' : 'Play Lofi'}
      </span>
    </button>
  )
}
