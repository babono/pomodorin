import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Search a motivational quote specifically about productivity, focus, time management, or achieving goals. The quote should be:
- Inspirational and uplifting
- In Bahasa Indonesia and came from famous Indonesian motivator

Format your response as valid JSON with exactly this structure:
{
  "text": "Your motivational quote here",
  "author": "Author Name"
}

Only return the JSON, no additional text or formatting.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    // Try to parse the JSON response
    let quoteData
    try {
      quoteData = JSON.parse(response)
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\{[^}]*"text"[^}]*"author"[^}]*\}/)
      if (jsonMatch) {
        quoteData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Invalid response format from AI')
      }
    }

    // Validate the response structure
    if (!quoteData.text || !quoteData.author) {
      throw new Error('Invalid quote structure')
    }

    return NextResponse.json(quoteData)
  } catch (error) {
    console.error('Error generating quote:', error)
    
    // Return a fallback quote if AI fails
    const fallbackQuotes = [
      { text: "Keberhasilan hanya datang kepada mereka yang fokus. Jangan biarkan dirimu terpecah oleh banyak hal, tentukan tujuan dan kejarlah sampai berhasil.", author: "Mario Teguh" },
      { text: "Ketekunan adalah kunci, dan fokus adalah bahan bakarnya.", author: "Andrie Wongso" },
      { text: "Goal tanpa fokus hanyalah mimpi. Goal dengan fokus akan menjadi kenyataan.", author: "Tung Desem Waringin" }
    ]
    
    const randomFallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
    
    return NextResponse.json(randomFallback)
  }
}
