import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export interface BodyScanResult {
  estimatedSize: string
  heightCategory: 'petite' | 'regular' | 'tall'
  bustProportion: 'fuller' | 'proportional' | 'smaller'
  bodyShape: 'balanced' | 'fuller_bust' | 'fuller_hips' | 'straight' | 'curvy_waist'
  confidence: 'low' | 'medium' | 'high'
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mimeType } = await request.json()

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'missing_image' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Analyze this full-body photo to estimate clothing sizes for a Brazilian woman.

Estimate the following based on visible body proportions only:
1. bodyShape: "balanced", "fuller_bust", "fuller_hips", "straight", or "curvy_waist"
2. estimatedSize: Brazilian women's size — "PP", "P", "M", "G", "GG", or "XGG"
3. heightCategory: "petite" (under 1.63m), "regular" (1.63–1.73m), or "tall" (over 1.73m)
4. bustProportion: "fuller" (larger than hips), "proportional", or "smaller"
5. confidence: "low", "medium", or "high" based on image quality and visibility
6. notes: one short sentence about fit considerations, in Portuguese (optional)

If the image has no visible full-body person or is unsuitable, return: {"error":"unsuitable_image"}

Respond ONLY with valid JSON, no explanation:
{"estimatedSize":"...","heightCategory":"...","bustProportion":"...","bodyShape":"...","confidence":"...","notes":"..."}`,
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

    // Extract JSON even if there's surrounding text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'parse_error' }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 422 })
    }

    return NextResponse.json(result as BodyScanResult)
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
