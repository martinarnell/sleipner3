import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey } from '@/lib/api-keys'

export async function POST(request: NextRequest) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.substring(7) // Remove "Bearer " prefix

    // Verify the API key
    const { valid, userId } = await verifyApiKey(apiKey)
    if (!valid || !userId) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { messages, model = 'gpt-3.5-turbo' } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    // For now, return a simple test response
    // TODO: Implement actual model routing logic
    const response = {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: `Hello! This is a test response from Sleipner. You sent ${messages.length} message(s). Model routing will be implemented here.`
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      },
      sleipner: {
        user_id: userId,
        routed_through: 'test-model',
        cost_saved: '0%'
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in chat completions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 