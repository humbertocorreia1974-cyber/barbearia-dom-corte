'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!accepted) {
      setError('Você precisa aceitar os Termos e a Política de Privacidade.');
      return;
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          password,
          acceptedTerms: true,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || 'Não foi possível criar sua conta. Tente novamente.');
        setLoading(false);
        return;
      }

      const login = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (login?.error) {
        router.push('/login');
        return;
      }
      router.push('/agendar');
      router.refresh();
    } catch {
      setError('Erro de conexão. Tente novamente em instantes.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-fg">
          Nome completo
        </label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Como podemos te chamar"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-fg">
          E-mail
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-fg">
          WhatsApp (opcional)
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(24) 99999-9999"
        />
        <p className="mt-1 text-xs text-fg-muted">
          Usamos para enviar o lembrete do seu horário 24h antes.
        </p>
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-fg">
          Senha
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo de 6 caracteres"
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-fg-muted">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        />
        <span>
          Li e aceito os{' '}
          <Link href="/termos" className="text-brand hover:underline">
            Termos de Uso
          </Link>{' '}
          e a{' '}
          <Link href="/privacidade" className="text-brand hover:underline">
            Política de Privacidade
          </Link>
          .
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-border bg-brand/10 px-3 py-2 text-sm text-brand"
        >
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full">
        {loading ? 'Criando conta...' : 'Criar conta e agendar'}
      </Button>
    </form>
  );
}
