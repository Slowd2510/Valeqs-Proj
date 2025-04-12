import type { APIRoute } from 'astro';
import { readFile, writeFile } from 'fs/promises';
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
    if (!data.id || !data.title || !data.description) {
      return new Response(
        JSON.stringify({ message: 'ID, title and description are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const blogsDir = path.join(process.cwd(), 'src', 'blogs');
    const postId = data.id;
    
    // Find the post file
    const filename = `status-${postId}.json`;
    const filePath = path.join(blogsDir, filename);
    
    // Read existing post data
    let existingData;
    try {
      const fileContent = await readFile(filePath, 'utf8');
      existingData = JSON.parse(fileContent);
    } catch (error) {
      return new Response(
        JSON.stringify({ message: 'Post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Update post data (preserve timestamp and author)
    const updatedData = {
      ...existingData,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      title_de: data.title_de || existingData.title_de,
      description_de: data.description_de || existingData.description_de
    };
    
    // Write updated data to file
    await writeFile(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
    
    return new Response(
      JSON.stringify({ 
        message: 'Post updated successfully',
        id: postId,
        filename: filename
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating post:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to update post', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};