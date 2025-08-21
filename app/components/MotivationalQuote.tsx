'use client'

import { useState, useEffect } from 'react'

interface Quote {
  text: string
  author: string
}

interface MotivationalQuoteProps {
  onGenerateQuote?: () => void
  triggerGenerate?: number
}

// Fallback quotes in case API fails
const fallbackQuotes: Quote[] = [
    { text: "Keberhasilan hanya datang kepada mereka yang fokus. Jangan biarkan dirimu terpecah oleh banyak hal, tentukan tujuan dan kejarlah sampai berhasil.", author: "Mario Teguh" },
    { text: "Ketekunan adalah kunci, dan fokus adalah bahan bakarnya.", author: "Andrie Wongso" },
    { text: "Goal tanpa fokus hanyalah mimpi. Goal dengan fokus akan menjadi kenyataan.", author: "Tung Desem Waringin" }
]

function MotivationalQuote({ triggerGenerate }: MotivationalQuoteProps) {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fadeClass, setFadeClass] = useState('opacity-100')

  const generateNewQuote = async () => {
    setIsLoading(true)
    setFadeClass('opacity-100') // Keep visible during loading to show skeleton
    
    try {
      // Create promises for both the API call and minimum loading time
      const apiCall = fetch('/api/generate-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const minimumDelay = new Promise(resolve => setTimeout(resolve, 3000)) // 3 second delay
      
      // Wait for both the API call and minimum delay to complete
      const [response] = await Promise.all([apiCall, minimumDelay])
      
      if (!response.ok) {
        throw new Error('Failed to generate quote')
      }
      
      const newQuote = await response.json()
      
      // Set new quote and stop loading
      setCurrentQuote(newQuote)
      setIsLoading(false)
      
    } catch (error) {
      console.error('Error generating quote:', error)
      // Use fallback quote on error (also respect minimum delay)
      const minimumDelay = new Promise(resolve => setTimeout(resolve, 3000))
      await minimumDelay
      
      const randomFallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
      setCurrentQuote(randomFallback)
      setIsLoading(false)
    }
  }

  // Generate initial quote on component mount
  useEffect(() => {
    generateNewQuote()
  }, [])

  // Handle trigger from parent component
  useEffect(() => {
    if (triggerGenerate && triggerGenerate > 0) {
      generateNewQuote()
    }
  }, [triggerGenerate])

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-white/30 h-7 rounded-md mb-4 w-4/5 mx-auto"></div>
      <div className="bg-white/30 h-7 rounded-md mb-3 w-3/4 mx-auto"></div>
      <div className="bg-white/25 h-5 rounded-md w-1/2 mx-auto"></div>
    </div>
  )

  return (
    <div className={`text-center px-4 max-w-2xl mx-auto transition-opacity duration-300 ${fadeClass}`}>
      {isLoading ? (
        <LoadingSkeleton />
      ) : currentQuote ? (
        <>
          <blockquote className="text-white/90 text-base italic mb-2">
            "{currentQuote.text}"
          </blockquote>
          <cite className="text-white/70 text-sm font-normal">
            — {currentQuote.author}
          </cite>
        </>
      ) : (
        <div className="text-white/60 text-base">
          Click the AI button below to generate an inspiring quote!
        </div>
      )}
    </div>
  )
}

export { type Quote, MotivationalQuote as default }
