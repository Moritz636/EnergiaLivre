export async function GET(request) {
  return new Response(JSON.stringify({ 
    success: true, 
    data: [],
    message: 'API funcionando! Em breve com dados reais.'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(request) {
  const body = await request.json();
  return new Response(JSON.stringify({ 
    success: true, 
    data: { id: Date.now(), ...body },
    message: 'Match criado com sucesso!'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}