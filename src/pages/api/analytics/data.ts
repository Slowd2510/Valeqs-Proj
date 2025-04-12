import type { APIRoute } from 'astro';
import { getVisitorStats, getPageViews, getBrowserStats } from '../../../lib/analytics';
import { isAdmin } from '../../../middleware/auth';

export const GET: APIRoute = async ({ request }) => {
  const isAdminUser = await isAdmin(request);
  
  if (!isAdminUser) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
  
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'all';
    
    let responseData: Record<string, any> = {};
    
    if (type === 'visitors' || type === 'all') {
      responseData.visitors = await getVisitorStats();
    }
    
    if (type === 'pages' || type === 'all') {
      responseData.pages = await getPageViews();
    }
    
    if (type === 'browsers' || type === 'all') {
      responseData.browsers = await getBrowserStats();
    }
    
    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=60'
        }
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};