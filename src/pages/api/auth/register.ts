import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client.ts';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('Register endpoint called');

    const body = await request.json();
    console.log('Request body:', body);

    const { email, password } = body;
    console.log('Register attempt for:', email);

    // Simple validation first
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
      });
    }

    // Additional validation for password strength
    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters long' }), {
        status: 400,
      });
    }

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    console.log('Supabase instance created');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log('Supabase response:', { data: !!data, error });

    if (error) {
      console.error('Register error:', error);
      // Translate common Supabase auth errors to Polish
      let errorMessage = error.message;
      if (error.message === 'User already registered') {
        errorMessage = 'Użytkownik o tym adresie email już istnieje';
      } else if (error.message.includes('Password')) {
        errorMessage = 'Hasło nie spełnia wymagań bezpieczeństwa';
      }

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 400,
      });
    }

    console.log('Registration successful for:', email);

    // Check if email confirmation is required
    const requiresConfirmation = !data.session;

    return new Response(JSON.stringify({
      user: data.user,
      requiresConfirmation
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('Unexpected error in register endpoint:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
};