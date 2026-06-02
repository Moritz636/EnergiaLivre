// Trecho principal do handleSubmit
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { 
    data: { 
      nome, 
      tipo, 
      whatsapp, 
      cidade 
    } 
  }
});

if (data.user) {
  // Salva também na tabela de leads para o admin ver
  await supabase.from('leads').insert({
    nome, email, whatsapp, cidade, tipo, status: 'pendente'
  });
  setSuccess(true);
}
