import { writeFile } from 'fs/promises';
import path from 'path';

// Einfache Admin-Prüfung
const verifyAdminSession = (request) => {
  const cookies = request.headers.get('cookie');
  // Vereinfachte Überprüfung - je nach deiner Auth-Implementation anpassen
  return cookies && cookies.includes('admin_session=');
};

export async function POST({ request }) {
  // Überprüfe Admin-Berechtigung
  if (!verifyAdminSession(request)) {
    return new Response(JSON.stringify({ error: 'Nicht autorisiert' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const formData = await request.formData();
    
    // Hole alle Felder aus dem Formular
    const title = formData.get('title');
    const description = formData.get('description');
    const imageUrl = formData.get('imageUrl');
    const title_de = formData.get('title_de');
    const description_de = formData.get('description_de');
    const editMode = formData.get('editMode') === 'true';
    const postId = formData.get('postId');
    
    // Generiere ID und Zeitstempel
    const timestamp = new Date().toISOString();
    const id = editMode && postId ? parseInt(postId) : Date.now();
    
    // Erstelle Post-Objekt
    const blogPost = {
      title,
      description,
      imageUrl: imageUrl || '',
      timestamp,
      author: { username: 'Admin' },
      title_de: title_de || '',
      description_de: description_de || '',
      category: formData.get('category') || 'News'
    };
    
    // Speichere Datei
    const blogsDir = path.join(process.cwd(), 'src', 'blogs');
    const fileName = `post-${id}.json`;
    const filePath = path.join(blogsDir, fileName);
    
    await writeFile(filePath, JSON.stringify(blogPost, null, 2), 'utf-8');
    
    return new Response(JSON.stringify({ 
      success: true, 
      id,
      message: editMode ? 'Post aktualisiert' : 'Post erstellt' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating/updating post:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}