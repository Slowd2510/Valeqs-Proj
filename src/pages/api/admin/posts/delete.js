import path from 'path'; // Importiere das path-Modul
import { access, unlink } from 'fs/promises'; // Importiere access und unlink
import { constants } from 'fs'; // Importiere constants

const verifyAdminSession = (request) => {
  const cookies = request.headers.get('cookie');

  return cookies && cookies.includes('admin_session=');
};

export async function POST({ request }) {
  if (!verifyAdminSession(request)) {
    return new Response(JSON.stringify({ error: 'Nicht autorisiert' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { filename } = await request.json();

    if (!filename || typeof filename !== 'string') {
      return new Response(JSON.stringify({ error: 'Dateiname fehlt oder ist ungültig' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (filename.includes('/') || filename.includes('\\')) {
       return new Response(JSON.stringify({ error: 'Ungültiger Dateiname' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const blogsDir = path.join(process.cwd(), 'src', 'blogs');
    const filePath = path.join(blogsDir, filename);

    try {
      await access(filePath, constants.F_OK);
    } catch (e) {

      console.warn(`Attempted to delete non-existent file: ${filename}`);
      return new Response(JSON.stringify({ success: true, message: 'Datei nicht gefunden, aber Löschvorgang als erfolgreich betrachtet.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Datei löschen
    await unlink(filePath);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unbekannter Fehler beim Löschen' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}