import type { APIRoute } from 'astro';
import { trackPageView } from '../../../lib/analytics';
import crypto from 'crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Generate session ID from IP and user agent if not provided
    if (!data.sessionId) {
      const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      // Create hash from IP and user agent
      const hash = crypto.createHash('sha256');
      hash.update(`${ip}-${userAgent}`);
      data.sessionId = hash.digest('hex');
    }
    
    // Detect browser from user agent
    const userAgent = request.headers.get('user-agent') || '';
    if (!data.browser) {
      if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        data.browser = 'Chrome';
      } else if (userAgent.includes('Firefox')) {
        data.browser = 'Firefox';
      } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        data.browser = 'Safari';
      } else if (userAgent.includes('Edg')) {
        data.browser = 'Edge';
      } else {
        data.browser = 'Other';
      }
    }
    
    await trackPageView(data);
    
    return new Response(
      JSON.stringify({ success: true, sessionId: data.sessionId }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

export const GET: APIRoute = async ({ request }) => {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST'
      }
    }
  );
};