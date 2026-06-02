import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const body = await req.text();

  console.log(body);

  return new Response("ok");
});