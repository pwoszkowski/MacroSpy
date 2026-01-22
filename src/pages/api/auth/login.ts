import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log("Login endpoint called");

    const body = await request.json();
    console.log("Request body:", body);

    const { email, password } = body;
    console.log("Login attempt for:", email);

    // Simple validation first
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
      });
    }

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    console.log("Supabase instance created");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Supabase response:", { data: !!data, error });

    if (error) {
      console.error("Login error:", error);
      // Translate common Supabase auth errors to Polish
      let errorMessage = error.message;
      if (error.message === "Invalid login credentials") {
        errorMessage = "Nieprawidłowe dane logowania";
      } else if (error.message === "Email not confirmed") {
        errorMessage = "Adres email nie został potwierdzony";
      }

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 400,
      });
    }

    console.log("Login successful for:", email);
    return new Response(JSON.stringify({ user: data.user }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Unexpected error in login endpoint:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};
