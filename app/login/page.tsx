const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: profile } = await supabase.from('profiles').select('tipo').eq('id', data.user.id).single();

    if (profile?.tipo === 'admin') router.push('/admin/dashboard');
    else if (profile?.tipo === 'gerador') router.push('/dashboard-gerador');
    else router.push('/dashboard-consumidor');

  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
