import type { APIRoute } from 'astro';
import { unlink } from 'fs/promises';
import path from 'path';
import { isAdmin } from '../../../middleware/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check if user is admin
    const userIsAdmin = await isAdmin(request);
    if (!userIsAdmin) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.filename) {
      return new Response(
        JSON.stringify({ message: 'Filename is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Ensure we're only dealing with json files from the blogs directory
    const filename = path.basename(data.filename);
    if (!filename.endsWith('.json') || !filename.startsWith('status-')) {
      return new Response(
        JSON.stringify({ message: 'Invalid filename' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const blogsDir = path.join(process.cwd(), 'src', 'blogs');
    const filePath = path.join(blogsDir, filename);
    
    // Delete the file
    await unlink(filePath);
    
    return new Response(
      JSON.stringify({ message: 'Post deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting post:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to delete post', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};