import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
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
    if (!data.title || !data.description) {
      return new Response(
        JSON.stringify({ message: 'Title and description are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate post ID (timestamp)
    const timestamp = Date.now();
    data.id = timestamp;
    
    // Set post timestamp if not provided
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }
    
    // Ensure blogs directory exists
    const blogsDir = path.join(process.cwd(), 'src', 'blogs');
    await mkdir(blogsDir, { recursive: true });
    
    // Create filename
    const filename = `status-${timestamp}.json`;
    const filePath = path.join(blogsDir, filename);
    
    // Write post data to file
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return new Response(
      JSON.stringify({ 
        message: 'Post created successfully',
        id: timestamp,
        filename: filename
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to create post', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};