import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const note = formData.get('note')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: note || 'Analyze this food image carefully and return structured nutrition data.',
                },
              ],
            },
          ],
        }),
      }
    )

    const data = await response.json()

    // ✅ Handle Gemini rate limit
    if (response.status === 429) {
      return NextResponse.json(
        { error: 'GEMINI_RATE_LIMIT', cooldown: 180 },
        { status: 429 }
      )
    }

    // ✅ Handle other errors
    if (!response.ok) {
      return NextResponse.json(
        { error: JSON.stringify(data) },
        { status: 500 }
      )
    }

    return NextResponse.json({
      result: data,
    })
  } catch (error: any) {
    console.error('Gemini Image Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}