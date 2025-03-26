import fs from 'fs';
import path from 'path';

const blogsDir = path.join(process.cwd(), 'src', 'blogs');


try {
  if (!fs.existsSync(blogsDir)) {
    fs.mkdirSync(blogsDir, { recursive: true });
    console.log('Created blogs directory');
  }
} catch (err) {
  console.error('Error creating blogs directory:', err);
}


console.log(`Watching for changes in ${blogsDir}...`);
fs.watch(blogsDir, (eventType, filename) => {
  if (filename && filename.endsWith('.json')) {
    console.log(`${eventType}: ${filename}`);
   
  }
});