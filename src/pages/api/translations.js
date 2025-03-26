import { loadTranslations } from '../../utils/language.js';

// Note: Using uppercase "GET" (not lowercase "get")
export async function GET({ request }) {
  try {
    // Remove the 'c' character here that's causing syntax error
    const url = new URL(request.url);
    const lang = url.searchParams.get('lang') || 'en';
    
    // Validate language code to prevent directory traversal attacks
    const validLangs = ['en', 'de'];
    const safeLang = validLangs.includes(lang) ? lang : 'en';
    
    // Load translations
    const translations = await loadTranslations(safeLang);
    
    // Return as JSON with caching headers
    return new Response(JSON.stringify(translations), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for an hour
      }
    });
  } catch (error) {
    console.error('Error in translations API:', error);
    return new Response(JSON.stringify({ error: 'Failed to load translations' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}