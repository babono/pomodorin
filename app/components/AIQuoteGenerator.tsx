'use client'

import { useState, useImperativeHandle, forwardRef } from 'react'
import MotivationalQuote from './MotivationalQuote'

export interface AIQuoteGeneratorRef {
  generateNewQuote: () => Promise<void>
}

const AIQuoteGenerator = forwardRef<AIQuoteGeneratorRef>((props, ref) => {
  const [triggerGenerate, setTriggerGenerate] = useState(0)

  const generateNewQuote = async () => {
    setTriggerGenerate(prev => prev + 1) // Increment to trigger re-generation
    
    // Wait for 3.5 seconds (3 seconds for loading + 0.5 seconds buffer)
    await new Promise(resolve => setTimeout(resolve, 3500))
  }

  useImperativeHandle(ref, () => ({
    generateNewQuote
  }))

  return <MotivationalQuote triggerGenerate={triggerGenerate} />
})

AIQuoteGenerator.displayName = 'AIQuoteGenerator'

export default AIQuoteGenerator
