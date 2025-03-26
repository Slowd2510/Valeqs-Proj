import { Translations } from '../types/translations';

/**
 * Gets the user's preferred language based on location or browser settings
 * @param {Request} request - The incoming request object from Astro
 * @returns {Promise<string>} - Language code ('en' or 'de')
 */
export async function getLanguage(request) {
  try {
    // 1. Check for Cloudflare country header (most reliable if using Cloudflare)
    const cfCountry = request.headers.get('cf-ipcountry');
    if (cfCountry === 'DE') {
      return 'de';
    }
    
    // 2. Try to get IP address from request headers
    const ipAddress = 
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.headers.get('client-ip');
    
    if (ipAddress) {
      try {
        // Use ipapi.co service to get country from IP
        const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        if (response.ok) {
          const data = await response.json();
          if (data.country_code === 'DE') {
            return 'de';
          }
        }
      } catch (error) {
        console.error('IP geolocation failed:', error);
      }
    }
    
    // 3. Check Accept-Language header as fallback
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage && acceptLanguage.includes('de')) {
      return 'de';
    }
    
    // Default to English
    return 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English on error
  }
}

/**
 * Load translations for the specified language
 * @param {string} lang - Language code ('en' or 'de')
 * @returns {Promise<Translations>} - Translation object
 */
export async function loadTranslations(lang) {
  try {
    // Import the appropriate translation file
    const translations = await import(`../translations/${lang}.json`);
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for ${lang}:`, error);
    // Fall back to English if translations can't be loaded
    const fallback = await import('../translations/en.json');
    return fallback.default;
  }
}