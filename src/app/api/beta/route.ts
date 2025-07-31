import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, isDisposableEmail } from '@/lib/rateLimit'
import { Database } from '@/lib/supabase'

// Use service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP address
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }

  const xRealIP = request.headers.get('x-real-ip')
  if (xRealIP) {
    return xRealIP.trim()
  }

  // Fallback for development
  return request.headers.get('cf-connecting-ip') || 
         request.headers.get('x-forwarded-for') || 
         '127.0.0.1'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, company, aiService, monthlySpend, source, website } = body

    // Honeypot check - if website field is filled, it's likely a bot
    if (website) {
      console.log('Bot detected: honeypot field filled')
      return NextResponse.json(
        { error: 'Invalid submission' },
        { status: 400 }
      )
    }

    // Input validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!aiService || typeof aiService !== 'string') {
      return NextResponse.json(
        { error: 'AI service is required' },
        { status: 400 }
      )
    }

    if (!monthlySpend || typeof monthlySpend !== 'string') {
      return NextResponse.json(
        { error: 'Monthly spend is required' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check for disposable email domains
    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: 'Please use a permanent email address' },
        { status: 400 }
      )
    }

    // Get client IP for rate limiting
    const clientIP = getClientIP(request)
    
    // Rate limiting: 5 submissions per hour per IP
    const rateLimitResult = checkRateLimit(clientIP, 5, 60 * 60 * 1000)
    if (!rateLimitResult.allowed) {
      const resetTimeMinutes = Math.ceil((rateLimitResult.resetTime - Date.now()) / (60 * 1000))
      return NextResponse.json(
        { 
          error: `Too many requests. Please try again in ${resetTimeMinutes} minutes.`,
          retryAfter: resetTimeMinutes 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': resetTimeMinutes.toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString()
          }
        }
      )
    }

    // Get user agent for tracking
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Prepare data for insertion
    const betaLeadData = {
      email: email.toLowerCase().trim(),
      company: company && typeof company === 'string' ? company.trim() : null,
      ai_service: aiService.trim(),
      monthly_spend: monthlySpend.trim(),
      ip: clientIP,
      user_agent: userAgent,
      source: source && typeof source === 'string' ? source.trim() : null,
    }

    // Insert into Supabase
    const { error } = await supabase
      .from('beta_leads')
      .insert(betaLeadData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      
      // Handle duplicate email
      if (error.code === '23505') { // unique_violation
        return NextResponse.json(
          { error: 'This email is already on our waitlist!' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to save your information. Please try again.' },
        { status: 500 }
      )
    }

    console.log('Beta signup successful:', { email: betaLeadData.email, ip: clientIP })

    // Set rate limit headers for successful requests
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Successfully joined the beta waitlist!' 
      },
      { status: 201 }
    )

    response.headers.set('X-RateLimit-Limit', '5')
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime / 1000).toString())

    return response

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}