import type { APIRoute } from 'astro';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { isAdmin } from '../../../middleware/auth';

export const GET: APIRoute = async ({ params, request }) => {
  try {
    // Check if user is admin
    const userIsAdmin = await isAdmin(request);
    if (!userIsAdmin) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const postId = params.id;
    
    if (!postId) {
      return new Response(
        JSON.stringify({ message: 'Post ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Find the post file
    const blogsDir = path.join(process.cwd(), 'src', 'blogs');
    const files = await readdir(blogsDir);
    const postFile = files.find(file => file.includes(`-${postId}.json`));
    
    if (!postFile) {
      return new Response(
        JSON.stringify({ message: 'Post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Read post data
    const filePath = path.join(blogsDir, postFile);
    const fileContent = await readFile(filePath, 'utf8');
    const postData = JSON.parse(fileContent);
    
    // Add filename to the response
    postData.filename = postFile;
    
    return new Response(
      JSON.stringify(postData),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching post:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to fetch post', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};