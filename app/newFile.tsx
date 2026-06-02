'use client';
await supabase.auth.signUp({
  email: 'teste@email.com',
  password: '123456'
});
