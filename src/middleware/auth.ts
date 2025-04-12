
import jwt from 'jsonwebtoken';

export async function isAuthenticated(request: Request) {
  const cookies = parseCookies(request.headers.get('cookie') || '');
  const sessionToken = cookies.admin_session;

  if (!sessionToken) {
    return false;
  }

  try {
    const payload = jwt.verify(
      sessionToken,
      import.meta.env.SESSION_SECRET
    ) as {
      admin: boolean;
      exp: number;
    };

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return false;
    }

    return payload.admin === true;
  } catch (error) {
    return false;
  }
}

export async function isAdmin(request: Request) {
  return await isAuthenticated(request);
}

export async function requireAuth(request: Request) {
  return await isAuthenticated(request);
}

export async function requireAdmin(request: Request) {
  return await isAdmin(request);
}

export function createCSRFToken() {
  return crypto.randomUUID();
}

export function validateCSRFToken(token: string, storedToken: string) {
  return token === storedToken;
}

function parseCookies(cookieHeader: string) {
  const list: Record<string, string> = {};
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...parts] = cookie.split('=');
    const trimmedName = name.trim();
    const value = parts.join('=').trim();
    
    if (trimmedName && value) {
      list[trimmedName] = decodeURIComponent(value);
    }
  });

  return list;
}