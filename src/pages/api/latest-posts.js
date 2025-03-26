import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export async function get() {
  try {
    const blogsDir = path.join(process.cwd(), 'src', 'blogs');
    const files = await readdir(blogsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const posts = await Promise.all(jsonFiles.map(async (file) => {
      const filePath = path.join(blogsDir, file);
      const content = await readFile(filePath, 'utf8');
      const blogData = JSON.parse(content);
      
    
      return {
        id: parseInt(file.split('-')[1].split('.')[0]),
        title: blogData.title || 'Untitled Post',
        date: new Date(blogData.timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        content: blogData.description || '',
        image: blogData.imageUrl || "/images/news/update.jpg"
      };
    }));
    
    
    const sortedPosts = posts.sort((a, b) => b.id - a.id);
    
    return new Response(JSON.stringify(sortedPosts), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return new Response(JSON.stringify({ error: 'Failed to load posts' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Made by SlowdX 