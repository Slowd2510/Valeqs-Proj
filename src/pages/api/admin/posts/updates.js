import { writeFile, access } from 'fs/promises';
import path from 'path';
import { constants } from 'fs';

// Admin-Session-Prüfung (gleich wie in create.js)
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
    const formData = await request.formData();
    const postId = formData.get('postId');
    
    if (!postId) {
      return new Response(JSON.stringify({ error: 'Post ID fehlt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Versuche die vorhandene Datei zu finden
    const blogsDir = path.join(process.cwd(), 'src', 'blogs');
    const fileName = `post-${postId}.json`;
    const filePath = path.join(blogsDir, fileName);
    
    try {
      await access(filePath, constants.F_OK);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Post nicht gefunden' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Rest wie in create.js - Blog-Post aktualisieren und speichern
    const title = formData.get('title');
    const description = formData.get('description');
    const imageUrl = formData.get('imageUrl');
    const title_de = formData.get('title_de');
    const description_de = formData.get('description_de');
    
    const blogPost = {
      title,
      description,
      imageUrl: imageUrl || '',
      timestamp: new Date().toISOString(), // Aktualisiere den Zeitstempel
      updated_at: new Date().toISOString(),
      author: { username: 'Admin' },
      title_de: title_de || '',
      description_de: description_de || '',
      category: formData.get('category') || 'News'
    };
    
    await writeFile(filePath, JSON.stringify(blogPost, null, 2), 'utf-8');
    
    return new Response(JSON.stringify({ success: true, id: postId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}