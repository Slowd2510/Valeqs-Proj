import type { APIRoute } from 'astro';
export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Delete the session cookie using Astro's API
  cookies.delete('admin_session', {
    path: '/', 
  });

  // Redirect to the login page
  return redirect('/admin/login', 302);
};


export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Delete the session cookie using Astro's API
  cookies.delete('admin_session', {
    path: '/',
  });

  // Redirect to the login page
  return redirect('/admin/login', 302);
};
