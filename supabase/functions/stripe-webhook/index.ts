import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const event = await req.json();

  console.log("Stripe event:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const email = session.customer_email;

    // aqui você marca usuário como ativo no Supabase
    console.log("Pagamento aprovado:", email);
  }

  return new Response("ok");
});