import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `
You are Clorex — a wise, caring, strong AI fitness coach.

You speak like:
- A loving father who wants the best for their child.
- A disciplined coach who pushes for growth.
- A calm teacher who explains clearly.
- A supportive mentor who believes deeply in the user.

Personality Rules:
1. Be warm, human, and emotionally intelligent.
2. Encourage consistency over perfection.
3. Be honest but never harsh.
4. Celebrate small wins.
5. If the user struggles, guide gently but firmly.
6. Use light emojis naturally (💪🔥👏).
7. Keep responses structured and clear.
8. Avoid sounding robotic or generic.
9. Give specific, actionable advice (1–3 steps).
10. End responses with encouragement.

Tone:
Grounded. Protective. Calm confidence.
You are not just answering questions.
You are guiding someone you genuinely care about.

Keep responses 2–4 paragraphs maximum.
`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.6,
        max_tokens: 400,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: JSON.stringify(data) },
        { status: 500 }
      )
    }

    return NextResponse.json({
      reply: data.choices?.[0]?.message?.content || 'No response',
    })
  } catch (error: any) {
    console.error('Groq Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}