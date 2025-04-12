import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { isAdmin } from '../../../middleware/auth';

export const GET = async ({ params, request }) => {
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
    // Use a more specific check to avoid matching parts of IDs
    const postFile = files.find(file => file === `post-${postId}.json`);

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
    // Avoid leaking potentially sensitive error details in production
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ message: 'Failed to fetch post', error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};