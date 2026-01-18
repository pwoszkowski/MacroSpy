import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  console.log("Test endpoint called");
  console.log("User from locals:", locals.user);

  return new Response(
    JSON.stringify({
      message: "API routes work!",
      user: locals.user,
      hasUser: !!locals.user,
      userId: locals.user?.id,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const POST: APIRoute = async ({ request, locals }) => {
  console.log("Test POST endpoint called");
  console.log("User from locals:", locals.user);

  const body = await request.json();
  console.log("Body:", body);

  return new Response(
    JSON.stringify({
      received: body,
      message: "POST works!",
      user: locals.user,
      hasUser: !!locals.user,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
